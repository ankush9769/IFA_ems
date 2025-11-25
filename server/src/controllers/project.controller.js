import createHttpError from 'http-errors';
import Project from '../models/Project.js';
import DailyUpdate from '../models/DailyUpdate.js';
import Client from '../models/Client.js';

/**
 * Build filters from query params. Supports text search, status, priority, clientType,
 * assigned, stockMarketFlag and clientId (filter projects of a particular client).
 */
const buildProjectFilters = (query) => {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.priority) filters.priority = query.priority;
  if (query.clientType) filters.clientType = query.clientType;
  if (query.assigned !== undefined) filters.assigned = query.assigned === 'true';
  if (query.stockMarketFlag !== undefined) filters.stockMarketFlag = query.stockMarketFlag === 'true';
  if (query.search) filters.$text = { $search: query.search };
  if (query.clientId) filters.client = query.clientId;
  return filters;
};

export const listProjects = async (req, res, next) => {
  try {
    const filters = buildProjectFilters(req.query);

    // Filter by employee if assigned=true is requested
    if (req.query.assigned === 'true' && req.user?.employeeRef) {
      filters.assignees = req.user.employeeRef;
    }

    // IMPORTANT: Clients should only see their own projects
    if (req.user?.role === 'client') {
      if (req.user?.clientRef) {
        // If client has a clientRef, filter by that
        filters.client = req.user.clientRef;
      } else {
        // If client doesn't have clientRef, filter by createdBy (their user ID)
        // This ensures clients only see projects they created
        filters.createdBy = req.user.sub;
      }
    }

    // Add text search if search query is provided
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filters.$or = [
        { clientName: searchRegex },
        { projectDescription: searchRegex },
        { projectType: searchRegex },
      ];
    }

    const projects = await Project.find(filters)
      .populate('assignees leadAssignee vaIncharge freelancer updateIncharge', 'name status')
      .populate('client', 'organization')
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a project. If payload.client (client id) is provided we verify that client exists
 * and add the project id to client's projects array. If the requester is a CLIENT role,
 * they may only create projects for their own linked client.
 */
export const createProject = async (req, res, next) => {
  try {
    const payload = { 
      ...req.body, 
      createdBy: req.user.sub,
      status: req.user.role === 'client' ? 'Contact Made' : (req.body.status || 'Active')
    };

    // If client role is creating a project, set default values
    if (req.user.role === 'client') {
      // Client projects start as unassigned and with "Contact Made" status
      payload.assigned = false;
      payload.clientType = payload.clientType || 'New';
      payload.priority = 'Medium'; // Admin will set the actual priority
    }

    // If client is provided in body, validate it
    if (payload.client) {
      const client = await Client.findById(payload.client);
      if (!client) throw createHttpError(404, 'Client not found');

      // client role can only create projects for their own clientRef
      if (req.user.role === 'client' && String(req.user.clientRef) !== String(payload.client)) {
        throw createHttpError(403, 'Not allowed to create projects for this client');
      }

      // copy organization name to clientName if not provided
      if (!payload.clientName) payload.clientName = client.organization;
    } else if (req.user.role === 'client') {
      // If a client user creates a project but didn't include client in payload,
      // use clientName from the form (clients may not have a linked Client record yet)
      if (!payload.clientName) {
        payload.clientName = req.user.name || 'Client';
      }
    }

    const project = await Project.create(payload);

    // If project has a client, ensure client's projects array contains this project
    if (project.client) {
      await Client.findByIdAndUpdate(
        project.client,
        { $addToSet: { projects: project._id } },
        { new: true }
      );
    }

    // populate before returning
    const populated = await Project.findById(project._id)
      .populate('assignees leadAssignee vaIncharge freelancer updateIncharge', 'name status')
      .populate('client', 'organization');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignees leadAssignee vaIncharge freelancer updateIncharge', 'name status')
      .populate('client', 'organization');

    if (!project) {
      throw createHttpError(404, 'Project not found');
    }

    // If requester is client, ensure they can only view their own projects
    if (req.user.role === 'client') {
      const isOwner = req.user.clientRef 
        ? String(req.user.clientRef) === String(project.client?._id)
        : String(req.user.sub) === String(project.createdBy);
      
      if (!isOwner) {
        throw createHttpError(403, 'Not allowed to view this project');
      }
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const existing = await Project.findById(req.params.id);
    if (!existing) throw createHttpError(404, 'Project not found');

    // If requester is client, ensure they can only update their own projects
    if (req.user.role === 'client') {
      const isOwner = req.user.clientRef 
        ? String(req.user.clientRef) === String(existing.client)
        : String(req.user.sub) === String(existing.createdBy);
      
      if (!isOwner) {
        throw createHttpError(403, 'Not allowed to update this project');
      }
    }

    // If client is being changed in update, validate and update client's projects arrays
    const newClientId = req.body.client;
    if (newClientId && String(newClientId) !== String(existing.client)) {
      const newClient = await Client.findById(newClientId);
      if (!newClient) throw createHttpError(404, 'New client not found');

      // remove from old client.projects and add to new client's projects
      if (existing.client) {
        await Client.findByIdAndUpdate(existing.client, { $pull: { projects: existing._id } });
      }
      await Client.findByIdAndUpdate(newClientId, { $addToSet: { projects: existing._id } });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.sub },
      { new: true, runValidators: true }
    )
      .populate('assignees leadAssignee vaIncharge freelancer updateIncharge', 'name status')
      .populate('client', 'organization');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const addProjectDailyUpdate = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw createHttpError(404, 'Project not found');
    }

    // If requester is client, ensure they can only add updates to their own project
    if (req.user.role === 'client') {
      const isOwner = req.user.clientRef 
        ? String(req.user.clientRef) === String(project.client)
        : String(req.user.sub) === String(project.createdBy);
      
      if (!isOwner) {
        throw createHttpError(403, 'Not allowed to add update to this project');
      }
    }

    const update = await DailyUpdate.create({
      ...req.body,
      project: project._id,
      createdBy: req.user.sub,
    });

    const total = await DailyUpdate.aggregate([
      { $match: { project: project._id } },
      { $group: { _id: null, hours: { $sum: '$hoursLogged' } } },
    ]);

    project.totalHoursSpent = total[0]?.hours ?? 0;
    await project.save();

    res.status(201).json(update);
  } catch (error) {
    next(error);
  }
};

export const getProjectDailyUpdates = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw createHttpError(404, 'Project not found');
    }

    const updates = await DailyUpdate.find({ project: project._id })
      .populate('employee', 'name roleTitle')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ updates });
  } catch (error) {
    next(error);
  }
};

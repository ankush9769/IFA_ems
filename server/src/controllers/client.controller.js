import Client from '../models/Client.js';
import Project from '../models/Project.js';
import createHttpError from 'http-errors';

export const listClients = async (_req, res, next) => {
  try {
    const clients = await Client.find()
      .populate('projects', 'clientName status endDate priority');
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // If client is a CLIENT role → restrict to their own linked client
    if (req.user.role === 'CLIENT' && req.user.linkedClient !== id) {
      throw createHttpError(403, 'Not allowed');
    }

    const client = await Client.findById(id);
    if (!client) throw createHttpError(404, 'Client not found');

    res.json(client);
  } catch (error) {
    next(error);
  }
};

export const getClientProjects = async (req, res, next) => {
  try {
    const { id } = req.params;

    // CLIENT role → only own data
    if (req.user.role === 'CLIENT' && req.user.linkedClient !== id) {
      throw createHttpError(403, 'Not allowed');
    }

    const client = await Client.findById(id).populate('projects');
    if (!client) throw createHttpError(404, 'Client not found');

    res.json({
      organization: client.organization,
      projects: client.projects,
    });
  } catch (error) {
    next(error);
  }
};

export const createClientProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    // CLIENT role → must match their linkedClient
    if (req.user.role === 'CLIENT' && req.user.linkedClient !== id) {
      throw createHttpError(403, 'Not allowed');
    }

    const client = await Client.findById(id);
    if (!client) throw createHttpError(404, 'Client not found');

    const payload = {
      ...req.body,
      clientName: client.organization,
      client: client._id,
      createdBy: req.user.sub,
    };

    const project = await Project.create(payload);

    client.projects.push(project._id);
    await client.save();

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

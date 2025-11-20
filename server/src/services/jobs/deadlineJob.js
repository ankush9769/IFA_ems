import cron from 'node-cron';
import Project from '../../models/Project.js';
import Notification from '../../models/Notification.js';

const schedule = process.env.DEADLINE_CRON || '0 9 * * *';

export const startNotificationJobs = () => {
  cron.schedule(schedule, async () => {
    const threshold = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const projects = await Project.find({
      endDate: { $lte: threshold, $gte: new Date() },
      deadlineAlertSent: false,
    }).populate('assignees');

    await Promise.all(
      projects.map(async (project) => {
        const recipients = project.assignees.map((a) => a.user);
        await Notification.create(
          recipients.map((recipient) => ({
            recipient,
            channel: 'email',
            template: 'deadline_reminder',
            payload: {
              clientName: project.clientName,
              endDate: project.endDate,
              priority: project.priority,
            },
          })),
        );
        project.deadlineAlertSent = true;
        await project.save();
      }),
    );
  });
};


import cron from 'node-cron';
import Project from '../../models/Project.js';
import Notification from '../../models/Notification.js';

const schedule = process.env.DEADLINE_CRON || '0 9 * * *';

export const startNotificationJobs = () => {
  try {
    console.log(`📅 Deadline notification job scheduled: ${schedule}`);
    
    cron.schedule(schedule, async () => {
      try {
        console.log('🔔 Running deadline notification check...');
        const threshold = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const projects = await Project.find({
          endDate: { $lte: threshold, $gte: new Date() },
          deadlineAlertSent: false,
        }).populate('assignees');

        if (projects.length === 0) {
          console.log('✅ No projects with upcoming deadlines');
          return;
        }

        console.log(`📧 Sending notifications for ${projects.length} projects`);

        await Promise.all(
          projects.map(async (project) => {
            try {
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
            } catch (error) {
              console.error(`❌ Error processing project ${project._id}:`, error.message);
            }
          }),
        );
        
        console.log('✅ Deadline notifications sent successfully');
      } catch (error) {
        console.error('❌ Error in deadline notification job:', error.message);
      }
    });
  } catch (error) {
    console.error('❌ Error starting notification jobs:', error.message);
  }
};


import React from 'react';
import { BookOpen, Kanban, Clock, MessageSquare, Briefcase } from 'lucide-react';
import { DocumentationCallout } from '@/components/apps/DocumentationCallout';

export type DocumentationSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

export type AppDocumentation = {
  id: string;
  name: string;
  description: string;
  purpose: React.ReactNode;
  icon: any;
  externalUrl?: string;
  sections: DocumentationSection[];
};

export const appsDocumentation: AppDocumentation[] = [
  {
    id: "hubstaff",
    name: "Hubstaff",
    description: "Track your working hours and manage your daily tasks.",
    purpose: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Track their working hours</li>
        <li>Start and stop work timers</li>
        <li>Organize daily tasks</li>
        <li>Track task progress</li>
        <li>Maintain a clear record of completed work</li>
      </ul>
    ),
    icon: Clock,
    externalUrl: "https://hubstaff.com/login",
    sections: [
      {
        id: "getting-started",
        title: "1. Getting Started",
        content: (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-ink">Download Hubstaff</h3>
            <p>Install the Hubstaff desktop application on your work computer. Use the official Hubstaff application provided for your operating system.</p>
            
            <h3 className="text-lg font-semibold text-ink mt-6">Login</h3>
            <p>Log in using your Maple work email.</p>
            <DocumentationCallout type="warning">
              Do not use a personal email account to log into Hubstaff.
            </DocumentationCallout>
          </div>
        )
      },
      {
        id: "start-your-workday",
        title: "2. Start Your Workday",
        content: (
          <div className="space-y-4">
            <p>After logging into Hubstaff:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open the Hubstaff application.</li>
              <li>Verify that you are logged in with your Maple work account.</li>
              <li>Open your task/to-do list.</li>
              <li>Select the task you are going to work on.</li>
              <li>Start the timer.</li>
              <li>Begin working on the selected task.</li>
            </ol>
            <DocumentationCallout type="important">
              Always make sure the timer is running when you begin working on a task.
            </DocumentationCallout>
          </div>
        )
      },
      {
        id: "create-your-task-list",
        title: "3. Create Your Task List",
        content: (
          <div className="space-y-4">
            <p>Create your daily to-do list in Hubstaff. Break your work into clear tasks.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/30">
                <div className="font-semibold text-green-800 dark:text-green-300 mb-2">Good Examples:</div>
                <ul className="list-disc pl-5 text-green-900 dark:text-green-100 text-sm space-y-1">
                  <li>Implement employee dashboard</li>
                  <li>Fix SCORM progress tracking</li>
                  <li>Create API documentation</li>
                  <li>Test course completion flow</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/30">
                <div className="font-semibold text-red-800 dark:text-red-300 mb-2">Avoid Vague Names:</div>
                <ul className="list-disc pl-5 text-red-900 dark:text-red-100 text-sm space-y-1">
                  <li>Work</li>
                  <li>Development</li>
                  <li>Task</li>
                  <li>Misc</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        id: "complete-and-switch-tasks",
        title: "4. Complete and Switch Tasks",
        content: (
          <div className="space-y-4">
            <p>When you finish a task:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Stop the current task timer.</li>
              <li>Mark the task as completed.</li>
              <li>Select the next task.</li>
              <li>Start the timer for the new task.</li>
              <li>Continue working.</li>
            </ol>
            <DocumentationCallout type="important">
              Do not leave the previous task timer running while working on another task.
            </DocumentationCallout>
          </div>
        )
      },
      {
        id: "daily-workflow",
        title: "5. Daily Workflow",
        content: (
          <div className="space-y-4">
            <p>Recommended workflow:</p>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-hairline font-mono text-sm text-slate-600 dark:text-slate-300 text-center space-y-2">
              <div>Start Workday</div>
              <div className="text-slate-400">↓</div>
              <div>Review To-Do List</div>
              <div className="text-slate-400">↓</div>
              <div>Select Task</div>
              <div className="text-slate-400">↓</div>
              <div>Start Timer</div>
              <div className="text-slate-400">↓</div>
              <div>Work</div>
              <div className="text-slate-400">↓</div>
              <div>Complete Task</div>
              <div className="text-slate-400">↓</div>
              <div>Stop Timer</div>
              <div className="text-slate-400">↓</div>
              <div>Start Next Task</div>
              <div className="text-slate-400">↓</div>
              <div>Repeat</div>
              <div className="text-slate-400">↓</div>
              <div>End Workday</div>
            </div>
          </div>
        )
      },
      {
        id: "best-practices",
        title: "6. Best Practices",
        content: (
          <div className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep task names specific.</li>
              <li>Start the timer before beginning work.</li>
              <li>Stop the timer when completing a task.</li>
              <li>Switch timers when moving between tasks.</li>
              <li>Keep your task list updated.</li>
              <li>Do not use personal accounts.</li>
              <li>Keep your daily work organized.</li>
            </ul>
            <DocumentationCallout type="info" title="Why it matters">
              Accurate task and time tracking helps the team understand work progress and identify blockers.
            </DocumentationCallout>
          </div>
        )
      }
    ]
  },
  {
    id: "confluence",
    name: "Confluence",
    description: "Maple's documentation and knowledge-sharing platform where official company documents and internal knowledge are maintained.",
    purpose: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Official documents</li>
        <li>Internal documentation</li>
        <li>Process documentation</li>
        <li>Team knowledge</li>
        <li>Guidelines</li>
        <li>Reference materials</li>
        <li>Learning resources</li>
      </ul>
    ),
    icon: BookOpen,
    externalUrl: "https://confluence.atlassian.com/",
    sections: [
      {
        id: "getting-access",
        title: "1. Getting Access",
        content: (
          <div className="space-y-4">
            <p>Employees should request access from their respective POD Lead.</p>
            <p>The POD Lead will provide the required access to the appropriate Confluence spaces/pages.</p>
            <DocumentationCallout type="important">
              If you cannot access a required document, contact your POD Lead instead of creating duplicate documents elsewhere.
            </DocumentationCallout>
          </div>
        )
      },
      {
        id: "start-learning",
        title: "2. Start Learning",
        content: (
          <div className="space-y-4">
            <p>After receiving access:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Log in to Confluence.</li>
              <li>Open your assigned space.</li>
              <li>Review the available documentation.</li>
              <li>Read existing documents before starting new work.</li>
              <li>Use the documentation as a reference for your work.</li>
            </ol>
          </div>
        )
      },
      {
        id: "recommended-usage",
        title: "3. Recommended Usage",
        content: (
          <div className="space-y-4">
            <p>Before asking a question about an internal process:</p>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-hairline font-mono text-sm text-slate-600 dark:text-slate-300 text-center space-y-2">
              <div>Check Confluence</div>
              <div className="text-slate-400">↓</div>
              <div>Search existing documentation</div>
              <div className="text-slate-400">↓</div>
              <div>Review relevant page</div>
              <div className="text-slate-400">↓</div>
              <div>If information is unavailable</div>
              <div className="text-slate-400">↓</div>
              <div>Ask the relevant POD Lead</div>
            </div>
            <DocumentationCallout type="tip">
              Before creating a new document, search Confluence to see whether the information already exists.
            </DocumentationCallout>
          </div>
        )
      },
      {
        id: "important-guidelines",
        title: "4. Important Guidelines",
        content: (
          <div className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li>Use Confluence as the source for official internal documentation.</li>
              <li>Do not duplicate official documents unnecessarily.</li>
              <li>Keep sensitive information within authorized spaces.</li>
              <li>Follow the access permissions provided to you.</li>
              <li>Ask your POD Lead if you need additional access.</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: "maple-bot",
    name: "Maple Bot",
    description: "Used for daily team updates and employee engagement activities.",
    purpose: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Provide daily stand-up updates</li>
        <li>Highlight blockers</li>
        <li>Recognize team members with Kudos</li>
        <li>Maintain team alignment</li>
      </ul>
    ),
    icon: MessageSquare,
    sections: [
      {
        id: "daily-stand-up",
        title: "1. Daily Stand-Up Updates",
        content: (
          <div className="space-y-4">
            <p>Use Maple Bot to provide your daily status update. Your update should include:</p>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-hairline space-y-3 text-sm">
              <div>
                <span className="font-semibold text-ink">Yesterday</span><br/>
                <span className="text-slate-500">What did you complete yesterday?</span>
              </div>
              <div>
                <span className="font-semibold text-ink">Today</span><br/>
                <span className="text-slate-500">What are you planning to work on today?</span>
              </div>
              <div>
                <span className="font-semibold text-ink">Blockers</span><br/>
                <span className="text-slate-500">Is anything preventing you from progressing?</span>
              </div>
            </div>
            
            <h4 className="font-semibold mt-4">Example:</h4>
            <div className="p-4 bg-surface rounded-lg border border-hairline font-mono text-sm text-slate-700 dark:text-slate-300">
              Yesterday:<br/>
              Completed the SCORM tracking API implementation.<br/><br/>
              Today:<br/>
              Testing course completion and progress tracking.<br/><br/>
              Blockers:<br/>
              Waiting for access to the staging environment.
            </div>
          </div>
        )
      },
      {
        id: "daily-update-workflow",
        title: "2. Daily Update Workflow",
        content: (
          <div className="space-y-4">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-hairline font-mono text-sm text-slate-600 dark:text-slate-300 text-center space-y-2">
              <div>Open Maple Bot</div>
              <div className="text-slate-400">↓</div>
              <div>Submit Yesterday's Completion</div>
              <div className="text-slate-400">↓</div>
              <div>Add Today's Tasks</div>
              <div className="text-slate-400">↓</div>
              <div>Add Blockers</div>
              <div className="text-slate-400">↓</div>
              <div>Submit Update</div>
            </div>
            <DocumentationCallout type="important">
              Keep your updates concise, specific, and relevant to your work.
            </DocumentationCallout>
          </div>
        )
      },
      {
        id: "give-kudos",
        title: "3. Give Kudos",
        content: (
          <div className="space-y-4">
            <p>Maple Bot can also be used to recognize and appreciate team members.</p>
            <p>Employees can give <strong>Kudos</strong> to teammates for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Helping with a task</li>
              <li>Supporting another team member</li>
              <li>Completing important work</li>
              <li>Going above expectations</li>
              <li>Sharing knowledge</li>
              <li>Supporting the team</li>
            </ul>
            
            <h4 className="font-semibold mt-4">When giving kudos:</h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Select the team member.</li>
              <li>Add the reason for the recognition.</li>
              <li>Select the appropriate stars/reward value if available.</li>
              <li>Submit the kudos.</li>
            </ol>
            
            <div className="p-4 bg-brand-green/5 dark:bg-brand-green/10 rounded-lg border border-brand-green/20 text-sm mt-4">
              <strong>Example:</strong><br/><br/>
              Kudos to Rahul ⭐⭐⭐⭐⭐<br/>
              Thank you for helping me resolve the SCORM tracking issue and explaining the implementation.
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: "trello",
    name: "Trello",
    description: "Used for task management, work planning, and tracking the progress of team activities.",
    purpose: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Task management</li>
        <li>Work planning</li>
        <li>Tracking progress</li>
        <li>Kanban board visualization</li>
      </ul>
    ),
    icon: Kanban,
    externalUrl: "https://trello.com/",
    sections: [
      {
        id: "join-board",
        title: "1. Join Your Trello Board",
        content: (
          <div className="space-y-4">
            <p>Join the Trello board associated with your team/POD.</p>
            <p>Your POD Lead or relevant team member will provide the required access.</p>
          </div>
        )
      },
      {
        id: "create-task",
        title: "2. Create a Task",
        content: (
          <div className="space-y-4">
            <p>When creating a task, use a clear title.</p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex-1 p-3 bg-green-50 dark:bg-green-950/20 rounded border border-green-100 dark:border-green-900/30 text-sm">
                <span className="font-semibold text-green-800 dark:text-green-300">Do:</span><br/>
                Implement employee profile page
              </div>
              <div className="flex-1 p-3 bg-red-50 dark:bg-red-950/20 rounded border border-red-100 dark:border-red-900/30 text-sm">
                <span className="font-semibold text-red-800 dark:text-red-300">Don't:</span><br/>
                Profile
              </div>
            </div>
            
            <p className="mt-4">Add relevant information such as:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Description</li>
              <li>Requirements</li>
              <li>Due date</li>
              <li>Checklist</li>
              <li>Labels</li>
              <li>Attachments</li>
              <li>Related information</li>
            </ul>
          </div>
        )
      },
      {
        id: "manage-status",
        title: "3. Manage Task Status",
        content: (
          <div className="space-y-4">
            <p>Follow the workflow configured by your team. For example:</p>
            <div className="flex items-center gap-2 text-sm font-medium overflow-x-auto py-2">
              <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded">To Do</div>
              <div className="text-slate-400">→</div>
              <div className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded">In Progress</div>
              <div className="text-slate-400">→</div>
              <div className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded">Review</div>
              <div className="text-slate-400">→</div>
              <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded">Completed</div>
            </div>
            <p>Move the card as the task progresses.</p>
          </div>
        )
      },
      {
        id: "keep-updated",
        title: "4. Keep Trello Updated",
        content: (
          <div className="space-y-4">
            <p>Update your task when:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Work begins</li>
              <li>Requirements change</li>
              <li>You encounter a blocker</li>
              <li>Work is ready for review</li>
              <li>Work is completed</li>
            </ul>
            <DocumentationCallout type="important">
              Trello should reflect the actual current status of your work.
            </DocumentationCallout>
          </div>
        )
      }
    ]
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    description: "Provides Maple with the core tools used for communication, document creation, collaboration, meetings, file storage, and productivity.",
    purpose: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Communication</li>
        <li>Document creation</li>
        <li>Collaboration</li>
        <li>Meetings</li>
        <li>File storage</li>
        <li>Productivity</li>
      </ul>
    ),
    icon: Briefcase,
    externalUrl: "https://workspace.google.com/",
    sections: [
      {
        id: "included-tools",
        title: "1. What Google Workspace Includes",
        content: (
          <div className="space-y-4">
            <p>Common tools include:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gmail</li>
              <li>Google Drive</li>
              <li>Google Docs</li>
              <li>Google Sheets</li>
              <li>Google Slides</li>
              <li>Google Meet</li>
              <li>Google Calendar</li>
            </ul>
          </div>
        )
      },
      {
        id: "gmail",
        title: "2. Gmail",
        content: (
          <div className="space-y-4">
            <p>Used for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Company communication</li>
              <li>Internal communication</li>
              <li>External professional communication</li>
              <li>Receiving company notifications</li>
            </ul>
            <DocumentationCallout type="info">
              Use your Maple work email for official communication.
            </DocumentationCallout>
          </div>
        )
      },
      {
        id: "google-drive",
        title: "3. Google Drive",
        content: (
          <div className="space-y-4">
            <p>Used for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Storing files</li>
              <li>Sharing documents</li>
              <li>Team collaboration</li>
              <li>Accessing shared resources</li>
            </ul>
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">Store company documents in the appropriate shared location.</p>
          </div>
        )
      },
      {
        id: "google-docs",
        title: "4. Google Docs",
        content: (
          <div className="space-y-4">
            <p>Used for collaborative document creation and editing. Examples:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Meeting notes</li>
              <li>Documentation</li>
              <li>Drafts</li>
              <li>Team documents</li>
            </ul>
          </div>
        )
      },
      {
        id: "google-sheets-slides-meet",
        title: "5. Sheets, Slides, and Meet",
        content: (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Google Sheets</h4>
              <p className="text-sm">Used for data tracking, reports, lists, marketing data, and operational information.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Google Slides</h4>
              <p className="text-sm">Used for presentations, team meetings, client presentations, and internal presentations.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Google Meet</h4>
              <p className="text-sm">Used for team meetings, client meetings, virtual discussions, and training sessions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Google Calendar</h4>
              <p className="text-sm">Used for scheduling meetings, managing events, checking availability, and receiving meeting invitations.</p>
            </div>
          </div>
        )
      },
      {
        id: "google-workspace-best-practices",
        title: "6. Best Practices",
        content: (
          <div className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              <li>Use your Maple work account.</li>
              <li>Store company files in appropriate locations.</li>
              <li>Share documents only with intended recipients.</li>
              <li>Keep shared documents organized.</li>
              <li>Use professional communication.</li>
            </ul>
            <DocumentationCallout type="warning">
              Do not use personal accounts for official company work where the company account is required.
            </DocumentationCallout>
          </div>
        )
      }
    ]
  }
];

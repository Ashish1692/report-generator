### Deployment Runbook (Ops Execution)
```json
{
  "project_name": "Cloud Migrator V2",
  "ops_lead": "Jordan Smith",
  "deployment_date": "2025-05-20",
  "deployment_steps": [
    { "title": "Database Backup", "action": "Run pg_dump on prod-db-01", "owner": "DBA", "validation": "Verify .sql file size > 5GB" },
    { "title": "Stop Traffic", "action": "Drain ALB target groups", "owner": "SRE", "is_stop_go": true, "validation": "Confirm 0 active connections in CloudWatch" }
  ],
  "rollback_plan": "Restore database from backup and revert container image tag."
}
```
### Call Script
```json
{
    "meta": {
        "account": "Client Name",
        "call_type": "Weekly Sync",
        "call_date": "April 10, 2026",
        "pm": "Your Name",
        "presenter": "Program Manager",
        "audience": "Client Stakeholders"
    },
    "topics": [
        {
            "title": "Topic Title",
            "say_this": "Script language to speak out loud...",
            "technical_notes": "For your eyes only...",
            "tasks": [
                {
                    "num": "TASK001", "type": "Story", "assignee": "Dev Name", "title": "Task description", "state": "In Progress"
                }],
            "qa_pairs": [
                { "question": "Question they might ask", "answer": "Your answer" }
            ]
        }
    ],
    "closing_statement": "Thank you for your time..."
}
```

### Status Report

```json
{
    "meta": { "account": "...", "week_of": "...", "pm": "...", "org": "..." },
    "executive_summary": "Week summary text...",
    "metrics": {
        "open_incidents": 2, "stories_in_flight": 5, "blockers": 1,
        "tasks_closed_this_week": 3
    },
    "focus_item": { "title": "Item Title", "body": "Description..." },
    "incidents": [{
        "num": "INC001", "title": "...", "assignee": "...", "state": "...",
        "priority": "...", "note": "..."
    }],
    "stories": [{
        "num": "STRY001", "title": "...", "assignee": "...", "priority":
            "...",
        "state": "...", "phase": "WIP"
    }],
    "uat_backlog": ["Item 1", "Item 2"],
    "process_note": "Any process updates...",
    "blockers": [{ "blocker": "...", "impact": "...", "resolution": "..." }],
    "action_items": [{
        "owner": "...", "action": "...", "item": "TASK#", "due": "Date"
    }],
    "team": [{ "name": "...", "role": "...", "focus": "..." }]
}
```

### RCA

```json
{
    "incident": "INC0012345",
    "account": "Client Name",
    "summary": {
        "title": "...", "date_reported": "...", "date_resolved": "...",
        "severity":
            "...", "affected_system": "...", "reported_by": "...", "resolved_by": "...",
        "root_cause_category": "...", "downtime": "...", "impact_summary": "..."
    },
    "s1": "Incident overview text...",
    "s2": "Timeline narrative...",
    "s3": "Root cause explanation...",
    "s4": "Resolution steps...",
    "s5": "Prevention measures...",
    "s6": ["Lesson 1", "Lesson 2"],
    "s7": ["Action item 1", "Action item 2"],
    "s8": ["Follow-up 1"],
    "s10": "Document notes and distribution...",
    "timeline": [
        {
            "time": "10:00 AM", "event": "Alert triggered", "actor": "System", "type":
                "Detection"
        }
    ],
    "callout_boxes": [
        {
            "dev": "Developer Name", "section": "s3", "items": ["Verify this detail", "Confirmtimeline"]
        }
    ]
}
```

### Deployment Runbook (Ops Execution) V2

```json
{
  "runbook_title": "Deploy Portal Patch v1.2.8",
  "service": "Customer Portal",
  "environment": "PROD",
  "version": "1.0",
  "created_date": "2026-04-25",
  "author": "Your Name",
  "change_request": "CHG0032109",
  "maintenance_window": "2026-04-28 22:00-23:00 UTC",

  "prerequisites": [
    "Approved change in Scheduled state",
    "Backup completed successfully",
    "Access to Kubernetes cluster + admin role"
  ],
  "access_requirements": [
    "VPN connected",
    "kubectl configured",
    "Elevated role for deployment namespace"
  ],

  "pre_checks": [
    "Confirm current version running",
    "Confirm error budget/health green",
    "Confirm monitoring dashboard available"
  ],

  "execution_steps": [
    {
      "step_no": 1,
      "action": "Scale portal replicas to 0 (if required)",
      "command": "kubectl scale deploy portal --replicas=0 -n prod",
      "expected_result": "Pods terminated cleanly",
      "validation": "kubectl get pods -n prod shows 0 portal pods",
      "stop_go": "GO if no errors; STOP if termination hangs >5 mins"
    }
  ],

  "post_checks": [
    "Login test with test user",
    "Submit sample request end-to-end",
    "Check error rate < 1% for 15 mins"
  ],

  "monitoring": [
    "Dashboard: Portal Latency",
    "Dashboard: Auth Success Rate"
  ],

  "rollback_steps": [
    { "step_no": 1, "action": "Rollback to previous image tag", "command": "kubectl rollout undo deploy/portal -n prod", "validation": "Version reverted and login succeeds" }
  ],

  "contacts": [
    { "name": "On-call Platform", "role": "Executor", "contact": "+1-xxx" },
    { "name": "Service Owner", "role": "Approver", "contact": "owner@company.com" }
  ]
}
```

### Story Design (Same as Technical Approach Document)

```json
{
  "story_id": "STRY0010091",
  "title": "Auto-route incidents based on CI + Service",
  "requested_by": "Customer IT",
  "product_owner": "PO Name",
  "created_date": "2026-04-25",
  "author": "Your Name",

  "summary": "Implement routing logic using CI/service mapping to reduce assignment delays.",
  "in_scope": [
    "Flow/BR for routing",
    "Update assignment group mapping table",
    "Unit + UAT support"
  ],
  "out_of_scope": [
    "Redesign of incident form UI"
  ],
  "assumptions": [
    "CMDB relationships are accurate for targeted services"
  ],

  "acceptance_criteria": [
    "Incidents with CI populated are routed within 30 seconds",
    "Fallback rule applies if CI missing"
  ],

  "design": {
    "overview": "Use Flow Designer for routing; fallback to BR for edge cases."
  },

  "data_model_changes": [
    { "table": "u_ci_service_map", "change": "New table", "details": "Maps CI class + service to assignment group" },
    { "table": "incident", "change": "Field update", "details": "Ensure business rule reads cmdb_ci + business_service" }
  ],

  "implementation_components": [
    { "type": "Flow", "name": "INC Auto Route", "description": "Routes on create/update when CI changes" },
    { "type": "Business Rule", "name": "INC Route Fallback", "description": "Runs if flow cannot determine group" }
  ],

  "security": [
    { "item": "ACL", "details": "Only ITIL can edit mapping table" },
    { "item": "Role", "details": "Create role x_app.mapping_admin" }
  ],

  "integrations": [
    { "system": "None", "details": "No external integration for this story" }
  ],

  "testing": {
    "test_cases": [
      { "id": "TC01", "scenario": "CI+Service match", "expected": "Assignment group set to mapped group" },
      { "id": "TC02", "scenario": "CI missing", "expected": "Fallback group used" }
    ]
  },

  "deployment_notes": [
    "Update set naming: STRY0010091_Routing",
    "Promote to TEST then PROD after UAT sign-off"
  ],

  "risks": [
    { "description": "Bad CMDB data may misroute incidents", "impact": "High", "mitigation": "Limit to 3 services initially + monitor" }
  ],

  "open_questions": [
    "Which services are in phase 1 rollout?"
  ]
}
```
### Project Summary

```json
{
  "project_name": "E-Commerce Platform",
  "created_date": "April 21, 2024",
  "author": "Project Manager",
  "summary": "Monthly project status and key metrics",
  "key_metrics": [
    {
      "metric": "User Registration",
      "current": "2,450",
      "target": "3,000",
      "status": "On Track"
    },
    {
      "metric": "Revenue",
      "current": "$45,230",
      "target": "$50,000",
      "status": "Behind"
    },
    {
      "metric": "Revenue",
      "current": "$45,230",
      "target": "$50,000",
      "status": "Behind"
    }
  ],
  "milestones": [
    {
      "name": "Phase 1 Complete",
      "due_date": "April 30, 2024",
      "status": "Completed",
      "notes": "All core features implemented"
    },
    {
      "name": "Beta Launch",
      "due_date": "May 15, 2024",
      "status": "In Progress",
      "notes": "User testing in progress"
    }
  ],
  "risks": [
    {
      "description": "Third-party payment integration delay",
      "impact": "High",
      "mitigation": "Have backup payment processor ready"
    }
  ]
}
```
### Incident Resolution Summary

```json
{
  "incident_number": "INC0012345",
  "short_description": "Users unable to login",
  "description": "Desc",
  "priority": "P2",
  "service": "Customer Portal",
  "assignment_group": "Service Desk",
  "opened_at": "2026-04-20 09:12",
  "resolved_at": "2026-04-20 11:05",
  "created_date": "2026-04-25",
  "author": "Your Name",
  "impact": {
    "impact_start": "2026-04-20 09:05",
    "impact_end": "2026-04-20 11:05",
    "affected_users": "All external users",
    "business_impact": "Users could not submit requests",
    "customer_visible": "Yes"
  },
  "symptoms": ["Login redirects to error page"],
  "resolution": {
    "summary": "Restarted IdP and cleared cache",
    "workaround": "Use direct app URL",
    "root_cause_if_known": "Expired signing cert cached"
  },
  "resolution_steps": [
    { "step": "Validated IdP logs", "owner": "Platform" }
  ],
  "next_steps": [
    { "action": "Add cert expiry monitoring", "owner": "IAM", "due_date": "2026-05-05", "status": "Planned" }
  ],"related_records": { 
    "problem": "PRB0010203", 
    "change": "CHG0032109", 
    "kb": "KB0010099" 
  },
  "references": [
    { "label": "Story", "text": "STRY0010091", "url": "https://..." },
    { "label": "External Ticket", "text": "JIRA-402" },
    { "text": "Note: This fix requires a manual cache clear on the local client." }
  ]
}
```
### Task Brief

```json
{
  "account": "[String] Name of the account, client, or office location",
  "task_num": "[String] Unique identifier for the task or incident (e.g., INC0000000)",
  "task_type": "[String] Classification of the task (e.g., Incident, Request, Problem)",
  "title": "[String] Brief, descriptive title of the issue or request",
  "assigned_to": "[String] Name or group currently responsible for the task",
  "pm": "[String] Project Manager or primary point of contact",
  "reported_by": "[String] Name of the user who reported or requested the item",
  "opened_date": "[String] Date the ticket was created (e.g., Month DD, YYYY)",
  "target_date": "[String] Target completion or resolution date",
  "state": "[String] Current workflow state (e.g., New, In Progress, On Hold, Resolved)",
  "priority": "[String] Priority level indicating urgency and impact (e.g., 1 - High, 4 - Low)",
  "environment": "[String] The environment where the issue occurs (e.g., PROD, DEV, UAT)",
  "audience": "[String] Target audience impacted by the issue (e.g., Internal, External)",
  "summary": "[String] Comprehensive overview of the issue, current status, and relevant context",
  "reported_behavior": "[String] Exact description of what the user is experiencing",
  "expected_behavior": "[String] Description of how the system or process should normally function",
  "impact": "[String] Scope of the issue's effect on business operations or users",
  "investigation": {
    "summary": "[String] High-level summary of troubleshooting steps and triage performed so far",
    "findings": [
      "[String] Specific discovery, log entry, or fact identified during investigation",
      "[String] Additional discovery or context"
    ],
    "ruled_out": [
      "[String] Hypothesis or potential cause that has been tested and disproven"
    ],
    "current_theory": "[String] The leading hypothesis for the root cause of the issue"
  },
  "technical_detail": {
    "components_involved": [
      {
        "type": "[String] Category of the component (e.g., Table, Business Service, API)",
        "name": "[String] Specific name of the component",
        "table": "[String] Database table name, if applicable",
        "notes": "[String] Context on why this component is relevant to the issue"
      }
    ],
    "relevant_data": "[String] Key identifiers, system logs, or metadata useful for troubleshooting",
    "environment_notes": "[String] Details about system configurations, AI tools, or active deployments"
  },
  "proposed_approach": [
    {
      "option": "[String] Title of the proposed solution or workaround",
      "recommended": "[String] 'Yes' or 'No' indicating if this is the preferred path",
      "effort": "[String] Estimated level of effort (e.g., Low, Medium, High)",
      "risk": "[String] Risk level associated with this approach (e.g., Low, Medium, High)",
      "description": "[String] Detailed steps of what this approach entails",
      "reason": "[String] Justification for suggesting this specific approach"
    }
  ],
  "resolution": {
    "status": "[String] Resolution state (e.g., Pending, In Progress, Completed)",
    "description": "[String] Detailed explanation of the fix applied",
    "verification": "[String] Steps taken to confirm the fix was successful",
    "update_set": "[String] Associated deployment package or update set name, if applicable"
  },
  "next_steps": [
    {
      "action": "[String] Specific task that needs to be executed next",
      "owner": "[String] Person or team responsible for executing the action",
      "due": "[String] Deadline for this action item (e.g., YYYY-MM-DD)"
    }
  ],
  "blockers": [
    {
      "blocker": "[String] Description of the obstacle preventing progress",
      "type": "[String] Category of blocker (e.g., Access, Technical, Information)",
      "impact": "[String] How the blocker affects the resolution of the task",
      "owner": "[String] Person or team required to remove the blocker",
      "raised_date": "[String] Date the blocker was identified (e.g., YYYY-MM-DD)",
      "status": "[String] Current state of the blocker (e.g., Open, Resolved)",
      "resolution_path": "[String] Strategy or steps required to resolve the blocker"
    }
  ],
  "related_tasks": [
    "[String] Array of related task numbers (e.g., PRB000123, CHG000456)"
  ],
  "developer_notes": "[String] Internal, technical notes including SLA tracking, backend details, or triage history",
  "client_notes": "[String] Customer-facing update translating technical progress into business language",
  "callouts": [
    {
      "dev": "[String] Name of the specific developer, team member, or stakeholder",
      "items": [
        "[String] Direct question, request for clarification, or action item for this individual",
        "[String] Additional request or note"
      ]
    }
  ]
}
```
### Blocker Brief

```json
{
  "account": "[String] Name of the account, assignment group, or department",
  "task_num": "[String] Unique identifier for the ticket or task (e.g., INC0000000)",
  "title": "[String] Brief, descriptive summary of the issue",
  "reported_by": "[String] Name of the end-user who reported the issue",
  "assigned_to": "[String] Name of the agent or engineer currently working on the ticket",
  "pm": "[String] Name of the Project Manager or overseeing lead",
  "date": "[String] Date of the report or current update (e.g., Month DD, YYYY)",
  "status": "[String] Current workflow status (e.g., Under Investigation, In Progress, Resolved)",
  "summary": "[String] Comprehensive overview of the issue, current state, and recent escalations",
  "blocker_description": "[String] Detailed explanation of the specific hurdle preventing resolution",
  "impact": "[String] Description of how the issue affects the user's work, business operations, or delivery timelines",
  "investigation": "[String] Summary of the triage process, troubleshooting steps taken, and findings so far",
  "root_cause": "[String] Confirmed reason or leading theory for why the issue is occurring",
  "proposed_solutions": [
    {
      "option": "[String] Title of the proposed fix or workaround",
      "description": "[String] Detailed steps required to execute this solution",
      "effort": "[String] Estimated level of effort (e.g., Low, Medium, High)",
      "risk": "[String] Potential risk of implementing this solution (e.g., Low, Medium, High)",
      "status": "[String] Current state of this proposed solution (e.g., In progress, Not started, Completed)",
      "outcome": "[String] Result or findings after attempting this solution"
    }
  ],
  "resolution": "[String] Final fix applied to resolve the ticket (leave empty if still open)",
  "resolution_date": "[String] Date the ticket was resolved (e.g., YYYY-MM-DD)",
  "next_steps": [
    "[String] Specific, actionable next step including the owner and timeline"
  ],
  "open_questions": [
    "[String] Unanswered question required for troubleshooting or clarification"
  ],
  "technical_context": "[String] Backend system details, affected database tables, configurations, and related records",
  "client_communication": "[String] Summary of the latest update or messaging provided to the user/client",
  "callouts": [
    {
      "dev": "[String] Name of the specific team member, developer, or stakeholder",
      "items": [
        "[String] Direct question, task, or request for clarification directed at this person"
      ]
    }
  ]
}
```
### Technical Approach Document (Same as Story Design)

```json
{
  "account": "[String] Name of the account, assignment group, or department",
  "task_num": "[String] Unique identifier for the ticket or task (e.g., INC0000000)",
  "title": "[String] Clear, descriptive title of the initiative or task",
  "prepared_by": "[String] Name of the person who authored this document",
  "developer": "[String] Name of the developer or engineer assigned to the task",
  "date": "[String] Date of document creation or last update (e.g., Month DD, YYYY)",
  "status": "[String] Current state of the document or project (e.g., Under Review, Approved, Draft)",
  "version": "[String] Document version number (e.g., v1.0, v1.1)",
  "problem_statement": "[String] Comprehensive description of the core issue or pain point being addressed",
  "objective": "[String] The primary goal or expected outcome of this initiative",
  "background": "[String] Context, history, or triage details leading up to this proposed work",
  "scope": {
    "in_scope": [
      "[String] Specific deliverable, action, or feature included in the project scope",
      "[String] Another in-scope item"
    ],
    "out_of_scope": [
      "[String] Specific item, feature, or action explicitly excluded from this project",
      "[String] Another out-of-scope item"
    ],
    "dependencies": [
      "[String] External requirement, clarification, or prerequisite needed to complete the work"
    ]
  },
  "current_state": "[String] Description of the existing process, workflow, or system behavior before changes",
  "proposed_solution": "[String] Detailed overview of the intended fix, architecture, or new workflow",
  "technical_spec": {
    "platform": "[String] Target platform, application, or version (e.g., ServiceNow - Washington DC)",
    "components": [
      {
        "type": "[String] Type of technical component (e.g., Flow, Table, Script Include)",
        "name": "[String] Name of the specific component",
        "table": "[String] Database table associated with the component",
        "description": "[String] Purpose and function of this component within the solution",
        "is_oob": "[String] Indicates if the component is Out-of-Box (OOB), Modified OOB, or Custom"
      }
    ],
    "data_flow": "[String] Step-by-step sequence of how data or processes move through the proposed system",
    "roles_and_access": "[String] Required user roles, groups, or permissions for the solution to function",
    "integrations": "[String] Any third-party systems, APIs, or internal tools connected to this workflow",
    "known_constraints": "[String] Technical limitations, missing documentation, or known roadblocks"
  },
  "alternatives_considered": [
    {
      "option": "[String] Name of the alternative approach that was evaluated",
      "description": "[String] Brief summary of what this alternative entailed",
      "reason_rejected": "[String] Justification for why this alternative was not selected"
    }
  ],
  "test_plan": [
    {
      "scenario": "[String] Description of the specific test case or user action",
      "expected_result": "[String] The anticipated outcome if the solution functions correctly",
      "environment": "[String] The environment where testing will occur (e.g., DEV, TEST, UAT)"
    }
  ],
  "acceptance_criteria": [
    "[String] Specific, measurable condition that must be met for the work to be considered complete",
    "[String] Another acceptance criterion"
  ],
  "rollback_plan": "[String] Detailed steps to revert the system to its previous state if the deployment fails",
  "timeline": {
    "estimate": "[String] Estimated total time or effort required (e.g., 3 days dev, 2 days test)",
    "dev_start": "[String] Target or actual development start date (YYYY-MM-DD)",
    "target_test": "[String] Target date to deploy to the testing environment (YYYY-MM-DD)",
    "target_prod": "[String] Target date for production deployment (YYYY-MM-DD)",
    "notes": "[String] Any assumptions or conditions affecting the timeline"
  },
  "open_items": [
    {
      "item": "[String] Description of an unresolved question, task, or blocker",
      "owner": "[String] Person or team responsible for resolving this item",
      "due": "[String] Deadline for resolving the item (YYYY-MM-DD)"
    }
  ],
  "approvals": [
    {
      "name": "[String] Name of the required approver",
      "role": "[String] Title or role of the approver (e.g., PM, Developer, QA)",
      "status": "[String] Current approval status (e.g., Approved, Pending, Rejected)",
      "date": "[String] Date the approval status was updated (YYYY-MM-DD or leave blank if pending)"
    }
  ],
  "callouts": [
    {
      "dev": "[String] Name of the specific developer, team member, or stakeholder",
      "items": [
        "[String] Direct question, action item, or request for clarification directed at this person"
      ]
    }
  ],
  "notes": "[String] General administrative updates, active incident associations, or miscellaneous comments"
}
```
### Single Request Approval

```json
{
  "signoff_id": "ENHC001092",
  "title": "Automated Service Catalog Routing",
  "category": "User Story",
  "objective": "Streamline request fulfillment by routing to local teams based on user location.",
  "details": "We will implement a lookup on the 'cmn_location' table to identify the 'Support Group' associated with the requester's building.",
  "impact": "Reduces manual triage time by 45%.",
  "effort": "16 Hours",
  "requirements": [
    "User must have a building populated on their profile.",
    {
      "text": "Requirement: The 'Support Group' field must be mandatory.",
      "bold": true
    },
    {
      "text": "Note: This logic applies to top 5 items only.",
      "italic": true
    },
    {
      "text": "Nested Condition Example:",
      "sub_items": [
        "Sub-item 1: Verification step",
        {
          "text": "Sub-item 2: Deep Link",
          "url": "https://company.wiki"
        }
      ]
    },
    {
      "text": "Refer to the mapping document",
      "url": "https://company.wiki/map"
    }
  ]
}
```
### Bulk Appoval Requests

```json
{
  "project_name": "Q4 IT Service Desk Upgrades",
  "release_title": "Release Bundle - November",
  "approval_tasks": [
    {
      "num": "ENHC0013",
      "title": "Service Catalog Hardware Request Revamp",
      "objective": "Streamline the hardware request process for new hires.",
      "details": "Combine laptop, monitor, and accessory requests into a single dynamic form using conditional logic.",
      "effort": "12 Hours",
      "requirements": [
        "Hardware models must be pulled dynamically from the CMDB.",
        {
          "text": "Requirement: Manager approval workflow must be strictly enforced.",
          "bold": true
        },
        {
          "text": "Condition Rules:",
          "sub_items": [
            "If 'Developer' is selected, automatically add a secondary monitor.",
            {
              "text": "List of approved developer models",
              "url": "https://company.wiki/hardware/dev"
            }
          ]
        }
      ]
    },
    {
      "num": "STRY0056",
      "title": "Automated Password Reset Flow",
      "objective": "Reduce Tier 1 helpdesk tickets related to password resets.",
      "details": "Implement self-service password reset using Okta integration with an SMS or Email MFA challenge.",
      "effort": "20 Hours",
      "requirements": [
        "User must have a valid recovery email or phone number registered.",
        {
          "text": "Note: SMS gateway limits apply to international numbers.",
          "italic": true
        },
        {
          "text": "Refer to the Okta API specification",
          "url": "https://company.wiki/okta-integration"
        }
      ]
    },
    {
      "num": "DFCT0089",
      "title": "Fix Executive Dashboard Rendering Issues",
      "objective": "Ensure weekly performance charts render correctly on tablet devices.",
      "details": "Update the charting library and adjust CSS flexbox properties to prevent overlapping legends on iPad Pro viewports.",
      "effort": "6 Hours",
      "requirements": [
        "Must be tested on iOS 16+.",
        {
          "text": "Critical: Existing report data must not be altered or lost.",
          "bold": true
        },
        {
          "text": "Regression Testing Scope:",
          "sub_items": [
            "Verify standard desktop view remains intact.",
            "Check dark mode compatibility."
          ]
        }
      ]
    }
  ]
}
```
###

```json

```
###

```json

```
###

```json

```
###

```json

```
###

```json

```
###

```json

```
###

```json

```
###

```json

```
###

```json

```
###

```json

```
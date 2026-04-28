### Deployment Runbook (Ops Execution)
```json
{
  "project_name": "[String: Name of the project or deployment initiative]",
  "ops_lead": "[String: Name of the primary operations lead responsible]",
  "deployment_date": "[String: Planned date of deployment, e.g., YYYY-MM-DD]",
  "deployment_steps": [
    { 
      "title": "[String: Short title of the step]", 
      "action": "[String: Detailed instructions on what to execute]", 
      "owner": "[String: Person or team responsible for this specific step]", 
      "validation": "[String: How to verify the step was successful]",
      "is_stop_go": "[Boolean: True if this step requires a manual 'Go' decision before proceeding]"
    }
  ],
  "rollback_plan": "[String: High-level strategy to revert changes if the deployment fails]"
}
```

### Call Script
```json
{
    "meta": {
        "account": "[String: Name of the client or account]",
        "call_type": "[String: Nature of the call, e.g., Weekly Sync, Kickoff]",
        "call_date": "[String: Date of the meeting]",
        "pm": "[String: Project Manager name]",
        "presenter": "[String: Name of the person leading the presentation]",
        "audience": "[String: Roles or names of the people attending]"
    },
    "topics": [
        {
            "title": "[String: The agenda item title]",
            "say_this": "[String: Verbatim script for the presenter to speak out loud]",
            "technical_notes": "[String: Internal technical context not to be read out loud]",
            "tasks": [
                {
                    "num": "[String: Task ID, e.g., STRY/TASK/INC]", 
                    "type": "[String: Category of work]", 
                    "assignee": "[String: Person assigned]", 
                    "title": "[String: Summary of the work]", 
                    "state": "[String: Current status]"
                }],
            "qa_pairs": [
                { 
                  "question": "[String: Potential question from the audience]", 
                  "answer": "[String: Suggested response]" 
                }
            ]
        }
    ],
    "closing_statement": "[String: Concluding remarks and thank you note]"
}
```

### Status Report
```json
{
    "meta": { 
      "account": "[String: Client Name]", 
      "week_of": "[String: Reporting period date]", 
      "pm": "[String: Project Manager]", 
      "org": "[String: Internal Department/Org]" 
    },
    "executive_summary": "[String: 2-3 sentence overview of the week's progress and health]",
    "metrics": {
        "open_incidents": "[Number: Count of active incidents]", 
        "stories_in_flight": "[Number: Count of active stories]", 
        "blockers": "[Number: Count of active blockers]",
        "tasks_closed_this_week": "[Number: Count of completed items]"
    },
    "focus_item": { 
      "title": "[String: Most important item of the week]", 
      "body": "[String: Detailed description of the focus item]" 
    },
    "incidents": [{
        "num": "[String: INC number]", 
        "title": "[String: Short description]", 
        "assignee": "[String: Assigned person]", 
        "state": "[String: Status]",
        "priority": "[String: P1-P4]", 
        "note": "[String: Latest update/comment]"
    }],
    "stories": [{
        "num": "[String: STRY/TASK number]", 
        "title": "[String: Description]", 
        "assignee": "[String: Person]", 
        "priority": "[String: Priority]",
        "state": "[String: Status]", 
        "phase": "[String: e.g., Dev, Testing, UAT]"
    }],
    "uat_backlog": ["[String: Item waiting for UAT]", "[String: Next item]"],
    "process_note": "[String: Updates regarding workflow or administrative changes]",
    "blockers": [{ 
      "blocker": "[String: What is stopping progress]", 
      "impact": "[String: Effect on timeline]", 
      "resolution": "[String: Steps to clear the blocker]" 
    }],
    "action_items": [{
        "owner": "[String: Person]", 
        "action": "[String: What needs to be done]", 
        "item": "[String: Related ticket number]", 
        "due": "[String: Deadline]"
    }],
    "team": [{ 
      "name": "[String: Team member]", 
      "role": "[String: Job title]", 
      "focus": "[String: Primary area of work]" 
    }]
}
```

### RCA (Root Cause Analysis)
```json
{
    "incident": "[String: Incident ID, e.g., INC0012345]",
    "account": "[String: Client Name]",
    "summary": {
        "title": "[String: Descriptive name of the outage/issue]", 
        "date_reported": "[String: Start date/time]", 
        "date_resolved": "[String: End date/time]",
        "severity": "[String: Critical/High/Low]", 
        "affected_system": "[String: System or Application name]", 
        "reported_by": "[String: Person who found it]", 
        "resolved_by": "[String: Person who fixed it]",
        "root_cause_category": "[String: e.g., Hardware, Code, Human Error, Network]", 
        "downtime": "[String: Total duration of impact]", 
        "impact_summary": "[String: Number of users or business functions affected]"
    },
    "s1": "[String: Incident overview - What happened?]",
    "s2": "[String: Timeline Narrative - Detailed story of the response]",
    "s3": "[String: Root Cause - Why did it happen?]",
    "s4": "[String: Resolution - How was it fixed?]",
    "s5": "[String: Prevention - How will we stop it from happening again?]",
    "s6": ["[String: Lesson learned 1]", "[String: Lesson learned 2]"],
    "s7": ["[String: Action item 1]", "[String: Action item 2]"],
    "s8": ["[String: Follow-up task/meeting 1]"],
    "s10": "[String: Distribution list and final document notes]",
    "timeline": [
        {
            "time": "[String: HH:MM AM/PM]", 
            "event": "[String: What occurred]", 
            "actor": "[String: System or Person name]", 
            "type": "[String: e.g., Detection, Communication, Resolution]"
        }
    ],
    "callout_boxes": [
        {
            "dev": "[String: Name of person called out]", 
            "section": "[String: Related section ID, e.g., s3]", 
            "items": ["[String: Question or request for this person]"]
        }
    ]
}
```

### Deployment Runbook (Ops Execution) V2
```json
{
  "runbook_title": "[String: Official title of the deployment]",
  "service": "[String: Application or Service name]",
  "environment": "[String: PROD, UAT, or DEV]",
  "version": "[String: Release version number]",
  "created_date": "[String: Document date]",
  "author": "[String: Document author]",
  "change_request": "[String: Official Change ID, e.g., CHGXXXXX]",
  "maintenance_window": "[String: Start and End times in UTC/Local]",

  "prerequisites": [
    "[String: Task required before starting, e.g., Backup, Approval]"
  ],
  "access_requirements": [
    "[String: Specific access needed, e.g., VPN, SSH, Admin rights]"
  ],
  "pre_checks": [
    "[String: Verification step before execution, e.g., Health check]"
  ],
  "execution_steps": [
    {
      "step_no": "[Number: Sequence number]",
      "action": "[String: Descriptive action]",
      "command": "[String: The exact technical command to run, e.g., kubectl..., sqlplus...]",
      "expected_result": "[String: What should happen after the command]",
      "validation": "[String: Command to verify the result]",
      "stop_go": "[String: Instructions for 'GO' vs 'STOP' conditions]"
    }
  ],
  "post_checks": [
    "[String: Test to perform after deployment completion]"
  ],
  "monitoring": [
    "[String: Dashboard name or log file to watch for errors]"
  ],
  "rollback_steps": [
    { 
      "step_no": "[Number: Sequence]", 
      "action": "[String: Step to revert change]", 
      "command": "[String: Command to revert]", 
      "validation": "[String: How to check rollback success]" 
    }
  ],
  "contacts": [
    { 
      "name": "[String: Name]", 
      "role": "[String: e.g., Executor, Approver, Stakeholder]", 
      "contact": "[String: Phone or Email]" 
    }
  ]
}
```

### Story Design / Technical Approach
```json
{
  "story_id": "[String: STRY ID]",
  "title": "[String: Descriptive title of the feature/fix]",
  "requested_by": "[String: Customer or Stakeholder name]",
  "product_owner": "[String: PO name]",
  "created_date": "[String: Date]",
  "author": "[String: Name of person who wrote the design]",

  "summary": "[String: High-level overview of the goal]",
  "in_scope": ["[String: Specific feature or requirement included]"],
  "out_of_scope": ["[String: Explicitly excluded items]"],
  "assumptions": ["[String: Conditions assumed to be true]"],

  "acceptance_criteria": [
    "[String: Measurable condition for completion]"
  ],

  "design": {
    "overview": "[String: Brief technical narrative of the solution]"
  },

  "data_model_changes": [
    { 
      "table": "[String: DB Table Name]", 
      "change": "[String: New field, New table, or Modification]", 
      "details": "[String: Field names, types, or mapping details]" 
    }
  ],

  "implementation_components": [
    { 
      "type": "[String: e.g., Flow, Business Rule, Script Include]", 
      "name": "[String: Technical Name]", 
      "description": "[String: What this component does]" 
    }
  ],

  "security": [
    { 
      "item": "[String: e.g., ACL, Role, Query Business Rule]", 
      "details": "[String: Permissions and logic]" 
    }
  ],

  "integrations": [
    { 
      "system": "[String: External system name]", 
      "details": "[String: API info, authentication, or payload details]" 
    }
  ],

  "testing": {
    "test_cases": [
      { 
        "id": "[String: TC01]", 
        "scenario": "[String: What is being tested]", 
        "expected": "[String: Success condition]" 
      }
    ]
  },

  "deployment_notes": ["[String: Update set names or special migration steps]"],
  "risks": [
    { 
      "description": "[String: What could go wrong]", 
      "impact": "[String: High/Med/Low]", 
      "mitigation": "[String: How we avoid it]" 
    }
  ],
  "open_questions": ["[String: Unresolved design questions]"]
}
```

### Project Summary
```json
{
  "project_name": "[String: Name of the Project]",
  "created_date": "[String: Date]",
  "author": "[String: PM Name]",
  "summary": "[String: Brief monthly or phase-based overview]",
  "key_metrics": [
    {
      "metric": "[String: Metric name, e.g., Budget, User Adoption]",
      "current": "[String: Current value]",
      "target": "[String: Goal value]",
      "status": "[String: Green/Yellow/Red or On Track/Behind]"
    }
  ],
  "milestones": [
    {
      "name": "[String: Phase or Event name]",
      "due_date": "[String: Date]",
      "status": "[String: Completed/In Progress/Not Started]",
      "notes": "[String: Status update on this milestone]"
    }
  ],
  "risks": [
    {
      "description": "[String: Risk detail]",
      "impact": "[String: Severity]",
      "mitigation": "[String: Plan]"
    }
  ]
}
```

### Incident Resolution Summary
```json
{
  "incident_number": "[String: INC ID]",
  "short_description": "[String: Short summary of the ticket]",
  "description": "[String: Detailed problem description from user]",
  "priority": "[String: P1-P4]",
  "service": "[String: Business Service affected]",
  "assignment_group": "[String: Support group assigned]",
  "opened_at": "[String: Open time]",
  "resolved_at": "[String: Resolution time]",
  "created_date": "[String: Today's date]",
  "author": "[String: Name]",
  "impact": {
    "impact_start": "[String: Time]",
    "impact_end": "[String: Time]",
    "affected_users": "[String: Scope of users]",
    "business_impact": "[String: Revenue or Productivity loss]",
    "customer_visible": "[String: Yes/No]"
  },
  "symptoms": ["[String: Error message or behavior observed]"],
  "resolution": {
    "summary": "[String: How it was fixed]",
    "workaround": "[String: Temporary fix if any]",
    "root_cause_if_known": "[String: Known cause]"
  },
  "resolution_steps": [
    { "step": "[String: Action taken]", "owner": "[String: Person]" }
  ],
  "next_steps": [
    { 
      "action": "[String: Action item]", 
      "owner": "[String: Person]", 
      "due_date": "[String: Date]", 
      "status": "[String: Status]" 
    }
  ],
  "related_records": { 
    "problem": "[String: PRB ID]", 
    "change": "[String: CHG ID]", 
    "kb": "[String: KB ID]" 
  },
  "references": [
    { "label": "[String: Label, e.g., JIRA]", "text": "[String: ID]", "url": "[String: Link]" }
  ]
}
```

### Task Brief
```json
{
  "account": "[String: Account/Client Name]",
  "task_num": "[String: ID]",
  "task_type": "[String: INC, STRY, or TASK]",
  "title": "[String: Title]",
  "assigned_to": "[String: Owner]",
  "pm": "[String: PM]",
  "reported_by": "[String: Reporter]",
  "opened_date": "[String: Date]",
  "target_date": "[String: Deadline]",
  "state": "[String: Status]",
  "priority": "[String: Priority]",
  "environment": "[String: Environment]",
  "audience": "[String: Audience]",
  "summary": "[String: Full context summary]",
  "reported_behavior": "[String: What user sees]",
  "expected_behavior": "[String: What should happen]",
  "impact": "[String: Business impact]",
  "investigation": {
    "summary": "[String: Triage steps taken]",
    "findings": ["[String: Specific discovery]"],
    "ruled_out": ["[String: Hypothesis proven wrong]"],
    "current_theory": "[String: Leading cause hypothesis]"
  },
  "technical_detail": {
    "components_involved": [
      {
        "type": "[String: e.g., Table]",
        "name": "[String: Name]",
        "table": "[String: DB Table]",
        "notes": "[String: Why it is relevant]"
      }
    ],
    "relevant_data": "[String: Logs, IDs, or Metadata]",
    "environment_notes": "[String: Config details]"
  },
  "proposed_approach": [
    {
      "option": "[String: Solution name]",
      "recommended": "[String: Yes/No]",
      "effort": "[String: Level of effort]",
      "risk": "[String: Risk level]",
      "description": "[String: Detailed steps]",
      "reason": "[String: Justification]"
    }
  ],
  "resolution": {
    "status": "[String: Resolved/Closed]",
    "description": "[String: Fix detail]",
    "verification": "[String: Verification results]",
    "update_set": "[String: Update set name]"
  },
  "next_steps": [
    { "action": "[String: Task]", "owner": "[String: Person]", "due": "[String: Date]" }
  ],
  "blockers": [
    { 
      "blocker": "[String: Description]", 
      "type": "[String: Access/Technical]", 
      "impact": "[String: Impact]", 
      "owner": "[String: Person]", 
      "status": "[String: Status]", 
      "resolution_path": "[String: Strategy]" 
    }
  ],
  "related_tasks": ["[String: ID]"],
  "developer_notes": "[String: Technical history]",
  "client_notes": "[String: Business-friendly update]",
  "callouts": [
    { "dev": "[String: Name]", "items": ["[String: Question]"] }
  ]
}
```

### Blocker Brief
```json
{
  "account": "[String: Client Name]",
  "task_num": "[String: ID]",
  "title": "[String: Summary]",
  "reported_by": "[String: User]",
  "assigned_to": "[String: Agent]",
  "pm": "[String: PM]",
  "date": "[String: Date]",
  "status": "[String: Status]",
  "summary": "[String: Overview]",
  "blocker_description": "[String: What is blocking progress]",
  "impact": "[String: Why it matters to business/timeline]",
  "investigation": "[String: Triage and findings so far]",
  "root_cause": "[String: Reason for blocker]",
  "proposed_solutions": [
    {
      "option": "[String: Option Name]",
      "description": "[String: How to execute]",
      "effort": "[String: Effort]",
      "risk": "[String: Risk]",
      "status": "[String: Status]",
      "outcome": "[String: Result if attempted]"
    }
  ],
  "resolution": "[String: Final clearing action]",
  "resolution_date": "[String: Date]",
  "next_steps": ["[String: Step + Owner + Date]"],
  "open_questions": ["[String: Missing info]"],
  "technical_context": "[String: Backend/System details]",
  "client_communication": "[String: Message sent to client]",
  "callouts": [
    { "dev": "[String: Name]", "items": ["[String: Request for person]"] }
  ]
}
```

### Single Request Approval
```json
{
  "signoff_id": "[String: Unique ID for sign-off]",
  "title": "[String: Feature or Change Name]",
  "category": "[String: Category, e.g., Enhancement, Story]",
  "objective": "[String: Purpose of the change]",
  "details": "[String: Narrative description of work]",
  "impact": "[String: Benefit or outcome]",
  "effort": "[String: Estimated hours/days]",
  "requirements": [
    "[String: Simple requirement text]",
    {
      "text": "[String: Requirement needing formatting]",
      "bold": "[Boolean: True to make bold]",
      "italic": "[Boolean: True to make italic]",
      "url": "[String: Link to documentation]",
      "sub_items": ["[String: Nested requirement item]"]
    }
  ]
}
```

### Bulk Approval Requests
```json
{
  "project_name": "[String: Parent Project Name]",
  "release_title": "[String: Release Bundle name]",
  "approval_tasks": [
    {
      "num": "[String: ID]",
      "title": "[String: Task title]",
      "objective": "[String: Goal]",
      "details": "[String: Technical/Business details]",
      "effort": "[String: Effort]",
      "requirements": [
        "[String: Text]",
        {
          "text": "[String: Formatted requirement]",
          "bold": "[Boolean: True/False]",
          "sub_items": ["[String: Nested item]"],
          "url": "[String: Link]"
        }
      ]
    }
  ]
}
```
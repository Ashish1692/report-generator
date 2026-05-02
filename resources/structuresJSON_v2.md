# 1️⃣ Deployment Runbook (Ops Execution)

```json
{
  "project_name": "String: Official name of the deployment initiative. Should match project or change request title.",
  "ops_lead": "String: Full name of the person accountable for operational execution.",
  "deployment_date": "String (YYYY-MM-DD): Planned production deployment date.",
  "deployment_steps": [
    { 
      "title": "String: Short, clear name of this execution step.",
      "action": "String: Detailed operational instructions written so an engineer can execute without ambiguity.",
      "owner": "String: Individual or team responsible for completing this step.",
      "validation": "String: Clear success criteria or command/output used to confirm completion.",
      "is_stop_go": "Boolean: true if manual approval or confirmation is required before continuing."
    }
  ],
  "rollback_plan": "String: High-level but actionable strategy describing how to revert the deployment safely."
}
```



# 2️⃣ Call Script

```json
{
  "meta": {
    "account": "String: Client or account name.",
    "call_type": "String: Type of meeting (Weekly Sync, Kickoff, Executive Review).",
    "call_date": "String: Meeting date.",
    "pm": "String: Project Manager name.",
    "presenter": "String: Person delivering the script.",
    "audience": "String: Roles or specific attendees."
  },
  "topics": [
    {
      "title": "String: Agenda topic title.",
      "say_this": "String: Verbatim script to be spoken aloud.",
      "technical_notes": "String: Internal-only context, risks, or implementation details.",
      "tasks": [
        {
          "num": "String: Ticket identifier (INC, STORY, TASK).",
          "type": "String: Work classification.",
          "assignee": "String: Responsible individual.",
          "title": "String: Short description of task.",
          "state": "String: Current workflow state."
        }
      ],
      "qa_pairs": [
        {
          "question": "String: Likely stakeholder question.",
          "answer": "String: Suggested clear, business-friendly response."
        }
      ]
    }
  ],
  "closing_statement": "String: Final thank you and next-step reminder."
}
```



# 3️⃣ Status Report

```json
{
  "meta": { 
    "account": "String: Client name.",
    "week_of": "String: Reporting period start date.",
    "pm": "String: Project Manager.",
    "org": "String: Internal department."
  },
  "executive_summary": "String: 2-3 sentence leadership overview of health, risks, and progress.",
  "metrics": {
    "open_incidents": "Number: Active incidents.",
    "stories_in_flight": "Number: Active work items.",
    "blockers": "Number: Active blockers.",
    "tasks_closed_this_week": "Number: Completed items."
  },
  "focus_item": {
    "title": "String: Most important work item.",
    "body": "String: Detailed explanation of impact and status."
  },
  "incidents": [{
    "num": "String: Incident ID.",
    "title": "String: Short summary.",
    "assignee": "String: Owner.",
    "state": "String: Current state.",
    "priority": "String: P1-P4.",
    "note": "String: Latest update."
  }],
  "stories": [{
    "num": "String: Work ID.",
    "title": "String: Description.",
    "assignee": "String: Owner.",
    "priority": "String: Priority level.",
    "state": "String: Workflow state.",
    "phase": "String: Lifecycle stage."
  }],
  "uat_backlog": ["String: Item waiting for UAT approval."],
  "process_note": "String: Workflow or governance updates.",
  "blockers": [{
    "blocker": "String: What is blocking.",
    "impact": "String: Timeline or business effect.",
    "resolution": "String: Plan to remove blocker."
  }],
  "action_items": [{
    "owner": "String: Responsible person.",
    "action": "String: Required action.",
    "item": "String: Related ticket.",
    "due": "String: Deadline."
  }],
  "team": [{
    "name": "String: Team member.",
    "role": "String: Job title.",
    "focus": "String: Primary work focus."
  }]
}
```



# 4️⃣ RCA (Root Cause Analysis)

```json
{
  "incident": "String: Incident ID.",
  "account": "String: Client name.",
  "summary": {
    "title": "String: Incident headline.",
    "date_reported": "String: Start timestamp.",
    "date_resolved": "String: Resolution timestamp.",
    "severity": "String: Critical/High/Medium/Low.",
    "affected_system": "String: Application/system name.",
    "reported_by": "String: Reporter.",
    "resolved_by": "String: Resolver.",
    "root_cause_category": "String: Code, Network, Hardware, Human Error.",
    "downtime": "String: Duration.",
    "impact_summary": "String: Scope of impact."
  },
  "s1": "String: What happened.",
  "s2": "String: Timeline narrative.",
  "s3": "String: Why it happened.",
  "s4": "String: How fixed.",
  "s5": "String: Prevention plan.",
  "s6": ["String: Lessons learned."],
  "s7": ["String: Action items."],
  "s8": ["String: Follow-up actions."],
  "s10": "String: Distribution notes.",
  "timeline": [{
    "time": "String: Time entry.",
    "event": "String: Event description.",
    "actor": "String: Person/system.",
    "type": "String: Detection/Resolution/etc."
  }],
  "callout_boxes": [{
    "dev": "String: Person name.",
    "section": "String: Related section ID.",
    "items": ["String: Requested clarification."]
  }]
}
```

# 5️⃣ Deployment Runbook (Ops Execution) V2

```json
{
  "runbook_title": "String: Formal deployment title matching Change Request record.",
  "service": "String: Application, module, or service being deployed.",
  "environment": "String: Target environment (PROD, UAT, DEV).",
  "version": "String: Release or build version number.",
  "created_date": "String: Date document created or updated.",
  "author": "String: Person who authored the runbook.",
  "change_request": "String: Official Change ID (e.g., CHG0001234).",
  "maintenance_window": "String: Approved change window with timezone.",

  "prerequisites": [
    "String: Required approvals, backups, stakeholder confirmations before starting."
  ],
  "access_requirements": [
    "String: Required system access (VPN, SSH, Admin role, Cloud console)."
  ],
  "pre_checks": [
    "String: System validation steps before executing deployment."
  ],
  "execution_steps": [
    {
      "step_no": "Number: Sequential step order.",
      "action": "String: Clear description of what to do.",
      "command": "String: Exact command/script to execute.",
      "expected_result": "String: Expected output or system state.",
      "validation": "String: How to verify success.",
      "stop_go": "String: Instructions if validation fails or requires approval."
    }
  ],
  "post_checks": [
    "String: Validation tests after deployment."
  ],
  "monitoring": [
    "String: Dashboards, logs, or alerts to monitor post-release."
  ],
  "rollback_steps": [
    {
      "step_no": "Number: Rollback sequence order.",
      "action": "String: Description of reversal step.",
      "command": "String: Command to revert change.",
      "validation": "String: How to confirm rollback succeeded."
    }
  ],
  "contacts": [
    {
      "name": "String: Person name.",
      "role": "String: Role in deployment.",
      "contact": "String: Email or phone."
    }
  ]
}
```



# 6️⃣ Technical Approach

```json
{
  "account": "String: Client or internal department.",
  "task_num": "String: Ticket number (INC/STORY/TASK).",
  "title": "String: Initiative name.",
  "prepared_by": "String: Author of document.",
  "developer": "String: Assigned engineer.",
  "date": "String: Document date.",
  "status": "String: Draft/Under Review/Approved.",
  "version": "String: Version number.",
  "problem_statement": "String: Detailed explanation of issue being solved.",
  "objective": "String: Desired measurable outcome.",
  "background": "String: Historical context and triage summary.",
  "scope": {
    "in_scope": ["String: Included deliverable."],
    "out_of_scope": ["String: Explicit exclusions."],
    "dependencies": ["String: External prerequisite."]
  },
  "current_state": "String: Description of current behavior/system.",
  "proposed_solution": "String: Technical approach explanation.",
  "technical_spec": {
    "platform": "String: Target platform and version.",
    "components": [
      {
        "type": "String: Component type.",
        "name": "String: Component name.",
        "table": "String: Related DB table.",
        "description": "String: Purpose.",
        "is_oob": "String: OOB/Modified OOB/Custom."
      }
    ],
    "data_flow": "String: Process sequence explanation.",
    "roles_and_access": "String: Required roles.",
    "integrations": "String: Connected systems.",
    "known_constraints": "String: Known limitations."
  },
  "alternatives_considered": [
    {
      "option": "String: Alternative name.",
      "description": "String: What it entailed.",
      "reason_rejected": "String: Why not chosen."
    }
  ],
  "test_plan": [
    {
      "scenario": "String: Test case description.",
      "expected_result": "String: Expected outcome.",
      "environment": "String: Environment."
    }
  ],
  "acceptance_criteria": [
    "String: Measurable completion condition."
  ],
  "rollback_plan": "String: Detailed rollback approach.",
  "timeline": {
    "estimate": "String: Effort estimate.",
    "dev_start": "String: Dev start date.",
    "target_test": "String: Test deployment date.",
    "target_prod": "String: Prod deployment date.",
    "notes": "String: Timeline assumptions."
  },
  "open_items": [
    {
      "item": "String: Open question or task.",
      "owner": "String: Responsible party.",
      "due": "String: Due date."
    }
  ],
  "approvals": [
    {
      "name": "String: Approver name.",
      "role": "String: Approver role.",
      "status": "String: Approval status.",
      "date": "String: Approval date."
    }
  ],
  "callouts": [
    {
      "dev": "String: Person being addressed.",
      "items": ["String: Direct request."]
    }
  ],
  "notes": "String: Additional administrative notes."
}
```



# 7️⃣ Project Summary

```json
{
  "project_name": "String: Official project title.",
  "created_date": "String: Report date.",
  "author": "String: PM name.",
  "summary": "String: High-level overview of phase/month.",
  "key_metrics": [
    {
      "metric": "String: Metric name.",
      "current": "String: Current value.",
      "target": "String: Goal value.",
      "status": "String: Green/Yellow/Red."
    }
  ],
  "milestones": [
    {
      "name": "String: Milestone name.",
      "due_date": "String: Due date.",
      "status": "String: Status.",
      "notes": "String: Status commentary."
    }
  ],
  "risks": [
    {
      "description": "String: Risk description.",
      "impact": "String: Severity level.",
      "mitigation": "String: Plan to reduce risk."
    }
  ]
}
```



# 8️⃣ Incident Resolution Summary

```json
{
  "incident_number": "String: Incident ID.",
  "short_description": "String: Brief summary.",
  "description": "String: Full user-reported issue.",
  "priority": "String: P1-P4.",
  "service": "String: Affected service.",
  "assignment_group": "String: Support team.",
  "opened_at": "String: Timestamp opened.",
  "resolved_at": "String: Timestamp resolved.",
  "created_date": "String: Document creation date.",
  "author": "String: Author name.",
  "impact": {
    "impact_start": "String: Start time.",
    "impact_end": "String: End time.",
    "affected_users": "String: Scope.",
    "business_impact": "String: Business consequence.",
    "customer_visible": "String: Yes/No."
  },
  "symptoms": ["String: Observed error behavior."],
  "resolution": {
    "summary": "String: Fix explanation.",
    "workaround": "String: Temporary fix if applicable.",
    "root_cause_if_known": "String: Root cause summary."
  },
  "resolution_steps": [
    { "step": "String: Action taken.", "owner": "String: Responsible person." }
  ],
  "next_steps": [
    {
      "action": "String: Follow-up action.",
      "owner": "String: Owner.",
      "due_date": "String: Deadline.",
      "status": "String: Current status."
    }
  ],
  "related_records": {
    "problem": "String: Problem ID.",
    "change": "String: Change ID.",
    "kb": "String: Knowledge article ID."
  },
  "references": [
    { "label": "String: External reference label.", "text": "String: ID.", "url": "String: Link." }
  ]
}
```



# 9️⃣ Task Brief

```json
{
  "account": "String: Client name.",
  "task_num": "String: Ticket ID.",
  "task_type": "String: INC/STORY/TASK.",
  "title": "String: Title.",
  "assigned_to": "String: Owner.",
  "pm": "String: PM name.",
  "reported_by": "String: Reporter.",
  "opened_date": "String: Date.",
  "target_date": "String: Deadline.",
  "state": "String: Status.",
  "priority": "String: Priority.",
  "environment": "String: ENV.",
  "audience": "String: Stakeholders.",
  "summary": "String: Full context.",
  "reported_behavior": "String: What user experiences.",
  "expected_behavior": "String: Correct behavior.",
  "impact": "String: Business impact.",
  "investigation": {
    "summary": "String: Triage summary.",
    "findings": ["String: Discovery."],
    "ruled_out": ["String: Eliminated hypothesis."],
    "current_theory": "String: Likely cause."
  },
  "technical_detail": {
    "components_involved": [
      {
        "type": "String: Component type.",
        "name": "String: Name.",
        "table": "String: Table.",
        "notes": "String: Relevance."
      }
    ],
    "relevant_data": "String: Logs or IDs.",
    "environment_notes": "String: Config notes."
  },
  "proposed_approach": [
    {
      "option": "String: Solution option.",
      "recommended": "String: Yes/No.",
      "effort": "String: Effort level.",
      "risk": "String: Risk level.",
      "description": "String: Implementation steps.",
      "reason": "String: Justification."
    }
  ],
  "resolution": {
    "status": "String: Resolved/Closed.",
    "description": "String: Fix detail.",
    "verification": "String: How validated.",
    "update_set": "String: Update set name."
  },
  "next_steps": [
    { "action": "String: Task.", "owner": "String: Person.", "due": "String: Date." }
  ],
  "blockers": [
    {
      "blocker": "String: Blocking issue.",
      "type": "String: Access/Technical.",
      "impact": "String: Effect.",
      "owner": "String: Responsible person.",
      "status": "String: Status.",
      "resolution_path": "String: Strategy."
    }
  ],
  "related_tasks": ["String: Related ID."],
  "developer_notes": "String: Internal technical notes.",
  "client_notes": "String: Business update.",
  "callouts": [
    { "dev": "String: Person name.", "items": ["String: Question."] }
  ]
}
```



# 🔟 Blocker Brief

```json
{
  "account": "String: Client name.",
  "task_num": "String: ID.",
  "title": "String: Blocker summary.",
  "reported_by": "String: Reporter.",
  "assigned_to": "String: Owner.",
  "pm": "String: PM.",
  "date": "String: Date.",
  "status": "String: Status.",
  "summary": "String: Overview.",
  "blocker_description": "String: What blocks progress.",
  "impact": "String: Why it matters.",
  "investigation": "String: Findings.",
  "root_cause": "String: Reason.",
  "proposed_solutions": [
    {
      "option": "String: Option name.",
      "description": "String: Execution plan.",
      "effort": "String: Effort level.",
      "risk": "String: Risk.",
      "status": "String: Status.",
      "outcome": "String: Expected result."
    }
  ],
  "resolution": "String: Clearing action.",
  "resolution_date": "String: Date resolved.",
  "next_steps": ["String: Step + owner + date."],
  "open_questions": ["String: Missing info."],
  "technical_context": "String: System-level details.",
  "client_communication": "String: Message sent.",
  "callouts": [
    { "dev": "String: Name.", "items": ["String: Request."] }
  ]
}
```



# 1️⃣1️⃣ Single Request Approval

```json
{
  "signoff_id": "String: Unique approval identifier.",
  "title": "String: Feature/change name.",
  "category": "String: Enhancement/Story/etc.",
  "objective": "String: Purpose.",
  "details": "String: Description of work.",
  "impact": "String: Business outcome.",
  "effort": "String: Estimated time.",
  "requirements": [
    "String: Simple requirement.",
    {
      "text": "String: Requirement needing formatting.",
      "bold": "Boolean: True if bold formatting required.",
      "italic": "Boolean: True if italic formatting required.",
      "url": "String: Supporting documentation link.",
      "sub_items": ["String: Nested item."]
    }
  ]
}
```



# 1️⃣2️⃣ Bulk Approval Requests

```json
{
  "project_name": "String: Parent project.",
  "release_title": "String: Bundle/release name.",
  "approval_tasks": [
    {
      "num": "String: Task ID.",
      "title": "String: Task title.",
      "objective": "String: Goal.",
      "details": "String: Description.",
      "effort": "String: Estimate.",
      "requirements": [
        "String: Requirement.",
        {
          "text": "String: Formatted requirement.",
          "bold": "Boolean: Bold formatting.",
          "sub_items": ["String: Nested item."],
          "url": "String: Link."
        }
      ]
    }
  ]
}
```



# 1️⃣3️⃣ Dev Handover

```json
{
  "project_title": "String: Initiative name.",
  "record_id": "String: Story or ticket ID.",
  "developer_name": "String: Current developer.",
  "handover_date": "String: Date.",
  "next_owner": "String: Person taking over.",
  "overall_status": "String: % complete and timeline remaining.",
  "work_inventory": [
    {
      "title": "String: Work item.",
      "status": "String: Status.",
      "percent": "String: Completion percentage.",
      "is_blocked": "Boolean: Whether blocked."
    }
  ],
  "completed_work": [
    {
      "sub_title": "String: Completed item.",
      "details": ["String: What was done."],
      "notes": "String: Important warnings."
    }
  ],
  "remaining_work": [
    {
      "title": "String: Pending item.",
      "priority": "String: Priority.",
      "todo": "String: Required action.",
      "blocked_by": "String: Dependency."
    }
  ],
  "blockers": [
    {
      "issue": "String: Blocking issue.",
      "impact": "String: Impact.",
      "workaround": "String: Temporary fix."
    }
  ],
  "contacts": [
    {
      "role": "String: Role.",
      "name": "String: Person.",
      "info": "String: Notes."
    }
  ],
  "resources": [
    {
      "category": "String: Resource type.",
      "links": ["String: URL."]
    }
  ],
  "environment": {
    "Branch": "String: Git branch.",
    "Update Sets": "String: Update set name."
  },
  "risks": [
    {
      "item": "String: Risk item.",
      "diff": "String: Difficulty.",
      "risk": "String: Risk level.",
      "mitigation": "String: Mitigation plan."
    }
  ],
  "next_steps_day1": ["String: Immediate actions."],
  "next_steps_days_rest": ["String: Ongoing actions."]
}
```



# 1️⃣4️⃣ KB Article

```json
{
  "category": "String: Knowledge category.",
  "system": "String: System name.",
  "kb_id": "String: KB identifier.",
  "owner": "String: Responsible team.",
  "last_updated": "String: Date.",
  "overall_status": "String: Active/Retired.",
  "severity": "String: Impact level.",
  "frequency": "String: Occurrence rate.",
  "summary_what": "String: Short problem description.",
  "summary_who": ["String: Impacted personas."],
  "technical_root_cause": "String: Root cause explanation.",
  "technical_error_log": "String: Error signature.",
  "impact_assessment": [
    { "type": "String: Impact type.", "desc": "String: Description." }
  ],
  "res_short_term": ["String: Workaround steps."],
  "res_permanent": ["String: Permanent fix steps."],
  "escalation_path": [
    {
      "scenario": "String: Escalation scenario.",
      "contact": "String: Person/team.",
      "channel": "String: Communication channel."
    }
  ],
  "occurrence_history": [
    {
      "date": "String: Date.",
      "id": "String: Record ID.",
      "type": "String: Record type.",
      "env": "String: Environment.",
      "res": "String: Resolution."
    }
  ],
  "triggers": ["String: Trigger event."],
  "personas": [
    {
      "name": "String: Role.",
      "impact": "String: Effect."
    }
  ],
  "related_records": [
    {
      "category": "String: Record relationship.",
      "links": ["String: ID."]
    }
  ],
  "prevention_steps": ["String: Preventive action."],
  "status_flags": ["String: Status tag."]
}
```



# 1️⃣5️⃣ Tech Spec Doc

```json
{
  "technical_title": "String: Specification document title.",
  "version": "String: Version number.",
  "date": "String: Date.",
  "author": "String: Author.",
  "company_name": "String: Organization.",
  "related_records": "String: Related story/change IDs.",
  "requirements": [
    {
      "title": "String: Requirement category.",
      "items": ["String: Requirement detail."]
    }
  ],
  "change_types": ["String: Type of change."],
  "environments": [
    {
      "name": "String: ENV name.",
      "status": "String: Status.",
      "update_set": "String: Update set.",
      "notes": "String: Notes."
    }
  ],
  "components": ["String: Technical component."],
  "implementation_steps": [
    {
      "title": "String: Step title.",
      "location": "String: Navigation path.",
      "details": [
        {
          "type": "String: Content type (p/list).",
          "text": "String: Paragraph content.",
          "bold": "Boolean: Bold formatting."
        }
      ],
      "snippet": "String: Code snippet."
    }
  ],
  "deployment_plan": ["String: Deployment step."],
  "rollback_plan": "String: Rollback description.",
  "risks": [
    {
      "risk": "String: Risk description.",
      "impact": "String: Severity.",
      "mitigation": "String: Mitigation."
    }
  ],
  "dependencies": ["String: Dependency."],
  "assumptions": ["String: Assumption."],
  "resources": {
    "Repository": "String: Repo URL.",
    "Jira Story": "String: Ticket ID."
  },
  "revisions": [
    {
      "version": "String: Version.",
      "date": "String: Date.",
      "author": "String: Author.",
      "change": "String: Description of revision."
    }
  ]
}
```

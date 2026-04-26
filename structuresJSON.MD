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

### Story Design

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
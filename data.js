const N = (label, detail, o = {}, children) => ({ label, detail, ...o, children });

const UNIT_III = {
  key: 'III',
  title: 'Application Security Models & Virtual Private Databases',
  short: 'Application Security & VPD',
  detail: 'Unit III is about controlling access: who a user is, what they may touch, and how much of the data they are allowed to see.',
  tip: 'Unit III decides what users are allowed to do.',
  children: [
    N('Database Application Security', 'The foundations: how applications, databases and DBMS software cooperate to keep information safe.', {
      analogy: 'A bank branch: the building is the DBMS, the vault is the database, and the counter staff are the application.',
      tip: 'Security objective = protect against unauthorized access AND modification.',
    }, [
      N('Application', 'A program designed to solve a problem or perform a specific business function.'),
      N('Database', 'A collection of related data used by applications.'),
      N('DBMS', 'Software that manages and maintains databases.'),
      N('Authentication', 'Verifying the identity of a user accessing an application or database.', { analogy: 'Showing your ID at the door: it proves who you are, nothing more.' }),
      N('Authorization', 'Determining which resources and operations a user may access.', { analogy: 'The guest list after the ID check: it decides which rooms you may enter.', tip: 'Authentication = who are you? Authorization = what may you do?' }),
      N('Privileges', 'Permissions assigned to database accounts.'),
      N('Security objective', 'Protect database information from unauthorized access and modification.'),
    ]),
    N('Types of Database Users', 'Eight roles that interact with an application database, each with a different level of responsibility.', { diagram: 'users' }, [
      N('Application Administrator', 'Manages application users and roles.'),
      N('Application Owner', 'Owns application tables and related objects.'),
      N('Application User', 'Performs tasks through the application.'),
      N('Database Administrator', 'Performs database administration tasks (DBA).'),
      N('Database User', 'An account assigned database privileges and roles.'),
      N('Proxy User', 'Accesses the database on behalf of another application user.', { analogy: 'A personal assistant who makes calls in your name.' }),
      N('Schema Owner', 'Owns database objects within a schema.'),
      N('Virtual User', 'Accesses the database through another database account.'),
    ]),
    N('Database Security Models', 'Formal models that describe who may do what to which object.', {}, [
      N('Access Matrix Model', 'Defines permissions between subjects and objects.', {
        diagram: 'matrix',
        example: 'User A can read and write Table 1, while User B can only read it.',
        tip: 'Subjects are rows, objects are columns, each cell lists the permitted operations.',
      }, [
        N('Subjects are rows', 'Subjects represent users or processes and are drawn as rows.'),
        N('Objects are columns', 'Objects represent tables, files and resources and are drawn as columns.'),
        N('Cells hold operations', 'Each cell specifies the permitted operations.'),
        N('Example', 'User A can read and write Table 1, while User B can only read it.'),
      ]),
      N('Access Modes Model', 'Describes the operations subjects may perform on objects. Based on concepts from the Take-Grant model.', { diagram: 'modes' }, [
        N('Static access modes', 'Operations on the data itself.', {}, [
          N('Use', 'Access without modification.'),
          N('Read', "View the object's contents."),
          N('Update', 'Modify existing contents.'),
          N('Create', 'Add new instances.'),
          N('Delete', 'Remove existing instances.'),
        ]),
        N('Dynamic access modes', 'Operations on the permissions themselves.', {}, [
          N('Grant', 'Assign access permissions.'),
          N('Revoke', 'Remove assigned permissions.'),
          N('Delegate', 'Grant permission-delegation rights.'),
          N('Abrogate', 'Grant revocation rights.'),
        ]),
      ]),
    ]),
    N('Types of Database Applications', 'Four architectures, each with its own place for security controls.', { diagram: 'apptypes' }, [
      N('Mainframe Applications', 'Centralized computing, traditionally managed through MIS.', {}, [
        N('Centralized architecture', 'Centralized computing architecture.'),
        N('Mainframe processing', 'Processing and information management performed by a mainframe.'),
        N('MIS', 'Traditionally managed through Management Information Systems.'),
      ]),
      N('Client-Server Applications', 'The client requests services and the database server answers.', {}, [
        N('Client requests', 'Client requests services from a server.'),
        N('Server processes', 'Database server processes queries and returns results.'),
        N('Split responsibilities', 'Separates client-side and server-side responsibilities.'),
      ]),
      N('Web Applications', 'Applications reached through a browser, with an application layer in front of the database.', {}, [
        N('Browser access', 'Applications accessed through web browsers.'),
        N('Application layer', 'Users interact with an application layer.'),
        N('App talks to DB', 'Application communicates with the database.'),
        N('Protect credentials', 'Database credentials and permissions require protection.'),
      ]),
      N('Data Warehouse Applications', 'Built for reporting and analysis across many sources.', {}, [
        N('Reporting workloads', 'Designed for reporting and analytical workloads.'),
        N('Many sources', 'Combine information from multiple sources.'),
        N('Controlled access', 'Require controlled access to stored information.'),
      ]),
    ]),
    N('Application Security Models', 'Four ways an application can decide what a user may do.', { diagram: 'rolechain' }, [
      N('Based on Database Roles', 'The database itself holds the roles that determine privileges.', {
        code: "CREATE ROLE clerk_role;\nGRANT SELECT, INSERT ON orders TO clerk_role;\nGRANT clerk_role TO alice;",
      }, [
        N('Accounts and passwords', 'Application maintains user accounts and encrypted passwords.'),
        N('One role per user', 'Each user is assigned a database role.'),
        N('Roles set privileges', 'Database roles determine privileges.'),
        N('Proxy users', 'Proxy users may be used to activate assigned roles.'),
      ]),
      N('Based on Application Roles', 'The application, not the database, authenticates and authorizes.', {}, [
        N('App authenticates', 'Authentication handled by the application.'),
        N('Users in app tables', 'Application users and credentials maintained in application tables.'),
        N('App-specific roles', 'Users assigned application-specific roles.'),
        N('Roles open modules', 'Roles determine accessible application modules and operations.'),
      ]),
      N('Based on Application Functions', 'Permissions attach to individual functions of the application.', {}, [
        N('Organized by function', 'Access organized according to individual application functions.'),
        N('Function-level control', 'Permissions can be managed at the function level.'),
        N('App controls operations', 'Application controls which operations users may perform.'),
      ]),
      N('Based on Roles and Functions', 'The most flexible model: functions are grouped into roles, and roles are given to users.', {
        tip: 'Functions → roles → users.',
      }, [
        N('Roles plus functions', 'Combines application roles with individual functions.'),
        N('Stored credentials', 'Application users are authenticated using stored credentials.'),
        N('Functions to roles', 'Functions are assigned to roles.'),
        N('Roles to users', 'Roles are assigned to users.'),
        N('Flexible authorization', 'Provides flexible application authorization.'),
      ]),
    ]),
    N('Data Encryption', 'Transforming readable data into unreadable data so that stolen data is useless.', { diagram: 'crypto', analogy: 'A locked box: anyone can carry it, only the key holder can open it.' }, [
      N('Purpose', 'Protect sensitive information by transforming readable data into encrypted data.'),
      N('Plaintext', 'Original readable information.'),
      N('Ciphertext', 'Encrypted information.'),
      N('Encryption key', 'Used in the encryption process.'),
      N('Decryption', 'Converts encrypted information back into readable information.'),
      N('Security application', 'Protecting sensitive stored information.'),
    ]),
    N('Virtual Private Databases', 'One physical table, a different view for every user.', {
      diagram: 'vpd',
      analogy: 'A library where each reader only sees the shelves they are cleared for. The building is shared; the view is personal.',
    }, [
      N('Introduction to VPD', 'A database security mechanism for controlling access to data.', {}, [
        N('Access control mechanism', 'Database security mechanism for controlling access to data.'),
        N('Different results', 'Different users can receive different results from the same table.'),
        N('Security policies', 'Access restrictions are implemented through security policies.'),
        N('Row-level control', 'Supports row-level access control.'),
      ]),
      N('VPD Using Views', 'A view shows only selected rows or columns of a table.', {
        code: "CREATE VIEW my_dept_emp AS\n  SELECT * FROM emp\n  WHERE deptno = 10;\nGRANT SELECT ON my_dept_emp TO alice;",
      }, [
        N('View', 'A view presents selected information from database tables.'),
        N('Restrict rows or columns', 'Views can restrict which rows or columns are visible.'),
        N('Grant the view', 'Users may receive access to views instead of the underlying tables.'),
      ]),
      N('Application Context in Oracle', 'A small store of session facts that policies can read.', {
        code: "CREATE CONTEXT hr_ctx USING hr_ctx_pkg;\n-- inside the package:\nDBMS_SESSION.SET_CONTEXT('hr_ctx','dept', 10);\n-- inside a policy:\nSYS_CONTEXT('hr_ctx','dept')",
      }, [
        N('Session information', 'Stores information about the current application session.'),
        N('Drives restrictions', 'Context information can be used to determine access restrictions.'),
        N('Identifies user/session', 'Helps security policies identify the active user or session.'),
      ]),
      N('Implementing Oracle VPD', 'Seven steps from empty schema to a tested policy.', {
        diagram: 'steps',
        code: "BEGIN\n  DBMS_RLS.ADD_POLICY(\n    object_name     => 'EMP',\n    policy_name     => 'emp_dept_pol',\n    policy_function => 'dept_predicate',\n    statement_types => 'SELECT');\nEND;",
      }, [
        N('Step 1: Test environment', 'Set up the test environment.'),
        N('Step 2: Application context', 'Create an application context.'),
        N('Step 3: Context package', 'Create a context management package.'),
        N('Step 4: Login trigger', 'Create a login trigger.'),
        N('Step 5: Security policies', 'Create security policies.'),
        N('Step 6: Apply to tables', 'Apply security policies to database tables.'),
        N('Step 7: Test as users', 'Test database access under different user contexts.'),
      ]),
      N('VPD Policies and Dictionary', 'The data dictionary tells you what is actually configured.', {
        code: "SELECT object_name, policy_name\n  FROM dba_policies;\nSELECT * FROM dba_context;",
      }, [
        N('Dictionary info', 'Database dictionary provides information about configured policies.'),
        N('Examine policies', 'Examine existing VPD policies.'),
        N('Examine contexts', 'Examine application contexts.'),
        N('Verify configuration', 'Verify security configuration.'),
      ]),
    ]),
    N('Row & Column Level Security', 'Two different ways to hide part of a table.', { diagram: 'rowcol' }, [
      N('Row-Level Security', 'Controls which records a user may access.', {
        example: 'Employees access only records belonging to their department.',
      }, [
        N('Which records', 'Controls which records a user may access.'),
        N('Identity or context', 'Policies can restrict access based on user identity or context.'),
        N('Example', 'Employees access only records belonging to their department.'),
      ]),
      N('Column-Level Security', 'Restricts access to particular table columns.', {
        example: 'Employee salary information visible only to authorized personnel.',
        code: "GRANT SELECT (empno, ename)\n  ON emp TO clerk_role;\n-- salary column stays hidden",
      }, [
        N('Particular columns', 'Restricts access to particular table columns.'),
        N('Protect sensitive fields', 'Protects sensitive fields from unauthorized users.'),
        N('Example', 'Employee salary information visible only to authorized personnel.'),
      ]),
      N('SQL Server Security', 'SQL Server techniques for restricted data access.', {}, [
        N('Restricted-access techniques', 'SQL Server techniques for implementing restricted data access.'),
        N('Policies and permissions', 'Security policies and permissions govern access to protected information.'),
        N('Different needs', 'Row-level and column-level restrictions serve different security requirements.'),
      ]),
    ]),
  ],
};

const UNIT_IV = {
  key: 'IV',
  title: 'Auditing Database Activities',
  short: 'Auditing Database Activities',
  detail: 'Unit IV is about evidence: recording what happened in the database so that activity can be examined, explained and trusted.',
  tip: 'Unit IV establishes what users actually did.',
  children: [
    N('Introduction to Auditing', 'Recording and examining database activities to monitor security and compliance.', {
      analogy: 'A security camera for data: it does not stop anyone, but nobody can claim nothing happened.',
    }, [
      N('Database auditing', 'Recording and examining database activities to monitor security and compliance.'),
      N('Trace changes', 'Helps trace changes to sensitive information.'),
      N('Detect misuse', 'Supports detection and investigation of unauthorized activity.'),
      N('Reinforces security', 'Reinforces database security measures.'),
      N('Shared responsibility', 'Auditing responsibilities may involve developers, database administrators, and business managers.'),
    ]),
    N('Auditing Fundamentals', 'Nine terms that every audit conversation uses.', { diagram: 'trail' }, [
      N('Audit', 'Process of examining and validating documents, data, systems, processes and activities.', {}, [
        N('Examine and validate', 'Examining and validating documents, data, systems, processes and activities.'),
        N('Meets objectives?', 'Determines whether the audited entity meets its objectives.'),
      ]),
      N('Audit Log', 'Chronological record of activities being audited.'),
      N('Audit Objectives', 'Define the standards against which an entity is evaluated.', {}, [
        N('Standards', 'Define the standards against which an entity is evaluated.'),
        N('Sources of standards', 'May include organizational policies, business rules, government regulations and security requirements.'),
      ]),
      N('Auditor', 'Authorized and qualified person responsible for examining and evaluating an entity.', {}, [
        N('Qualified person', 'Authorized and qualified person responsible for examining and evaluating an entity.'),
        N('Produces reports', 'Produces audit findings and reports.'),
      ]),
      N('Audit Procedure', 'Documented step-by-step instructions for conducting an audit.'),
      N('Audit Report', 'Document containing the results and findings of an audit.'),
      N('Audit Trail', 'Chronological record of system events, changes and operations.', { tip: 'Audit log = activities audited. Audit trail = system events and changes.' }),
      N('Data Audit', 'Tracks changes to stored data.', {}, [
        N('Tracks data changes', 'Tracks changes to stored data.'),
        N('Logs or tables', 'Records changes in logs or database tables.'),
      ]),
      N('Database Audit', 'Records database-level activities.', {}, [
        N('Database-level activity', 'Records database-level activities.'),
        N('Examples', 'Includes database startup, shutdown, logins and structural changes.'),
      ]),
    ]),
    N('Types of Auditing', 'Who performs the audit changes how independent the result is.', { diagram: 'intext' }, [
      N('Internal Auditing', 'Conducted by employees within an organization.', {}, [
        N('Done by employees', 'Conducted by employees within an organization.'),
        N('Evaluates', 'Evaluates internal processes, policies and compliance.'),
      ]),
      N('External Auditing', 'Conducted by authorized individuals outside the organization.', {}, [
        N('Done by outsiders', 'Conducted by authorized individuals outside the organization.'),
        N('Independent', 'Provides an independent examination.'),
      ]),
    ]),
    N('Auditing Activities', 'The day-to-day work of an audit programme.', {}, [
      N('Evaluate controls', 'Evaluate the effectiveness of security controls.'),
      N('Verify integrity', 'Verify reliability and integrity.'),
      N('Check compliance', 'Examine compliance with laws and regulations.'),
      N('Plan and procedures', 'Develop audit plans and procedures.'),
      N('Keep schedules', 'Maintain audit schedules.'),
      N('Monitor changes', 'Monitor changes to audited systems.'),
      N('Track requirements', 'Review updated industry requirements.'),
      N('Document findings', 'Document audit findings.'),
      N('Internal audits', 'Conduct internal audits.'),
      N('Coordinate externals', 'Coordinate with external auditors.'),
      N('Security and legal', 'Work with security and legal departments.'),
      N('Find problems', 'Identify security problems requiring attention.'),
      N('Contract compliance', 'Ensure contractual and organizational requirements are satisfied.'),
    ]),
    N('Auditing Environment', 'Everything an audit needs: goals, method, people and material.', { diagram: 'env' }, [
      N('Audit Objectives', 'Establish what must be evaluated.', {}, [
        N('What to evaluate', 'Establish what must be evaluated.'),
        N('Measurable requirements', 'Define measurable security and compliance requirements.'),
      ]),
      N('Audit Procedures', 'Documented instructions for performing audits.', {}, [
        N('Documented steps', 'Provide documented instructions for performing audits.'),
        N('Consistency', 'Ensure consistency in audit execution.'),
      ]),
      N('People', 'Everyone who takes part in the audit.', {}, [
        N('Auditors', 'Auditors.'),
        N('DBAs', 'Database administrators.'),
        N('Developers', 'Developers.'),
        N('Security personnel', 'Security personnel.'),
        N('Business managers', 'Business managers.'),
      ]),
      N('Audit Resources', 'What the audit works with.', {}, [
        N('Database records', 'Database records.'),
        N('Logs and trails', 'Logs and audit trails.'),
        N('Auditing tools', 'Auditing tools.'),
        N('Documentation', 'Documentation.'),
        N('Personnel and time', 'Personnel and time.'),
      ]),
    ]),
    N('Auditing in Oracle', 'What to watch for in an Oracle database, and which statement families matter.', { diagram: 'ddldcl' }, [
      N('Activity Monitoring', 'Watching objects, administrators and permission changes.', {}, [
        N('Object changes', 'Monitor changes involving database objects.'),
        N('Administrative actions', 'Track users performing administrative actions.'),
        N('Structure changes', 'Detect changes to database structures.'),
        N('Permission changes', 'Review permission changes.'),
      ]),
      N('Data Definition Language', 'Statements that change structure.', { code: "CREATE TABLE ...\nALTER TABLE ...\nDROP TABLE ...", tip: 'DDL = structure.' }, [
        N('CREATE', 'Create database objects.'),
        N('ALTER', 'Modify database objects.'),
        N('DROP', 'Delete database objects.'),
        N('Why audit DDL', 'DDL activity auditing helps detect structural changes.'),
      ]),
      N('Data Control Language', 'Statements that change permissions.', { code: "GRANT SELECT ON emp TO bob;\nREVOKE SELECT ON emp FROM bob;", tip: 'DCL = permissions.' }, [
        N('GRANT', 'Assign access privileges.'),
        N('REVOKE', 'Remove access privileges.'),
        N('Why audit DCL', 'Auditing helps track changes in permission assignments.'),
      ]),
    ]),
    N('Oracle Database Triggers', 'Code that fires by itself when an event happens, ideal for recording activity.', { diagram: 'trigger', analogy: 'A tripwire: step on it and a recorder starts automatically.' }, [
      N('Trigger Fundamentals', 'A database program that executes automatically when a specified event occurs.', {}, [
        N('Automatic execution', 'A trigger is a database program that executes automatically when a specified event occurs.'),
        N('Record and enforce', 'Can be used to record changes and enforce auditing requirements.'),
      ]),
      N('DDL Triggers', 'Triggers that react to structure-changing events.', {
        code: "CREATE OR REPLACE TRIGGER ddl_audit\nAFTER DDL ON SCHEMA\nBEGIN\n  INSERT INTO audit_ddl\n  VALUES (SYSDATE, USER,\n          ora_sysevent,\n          ora_dict_obj_name);\nEND;",
      }, [
        N('Structure events', 'Respond to database structure modification events.'),
        N('Create/modify/delete', 'Can record object creation, modification and deletion.'),
        N('Who did it', 'Help identify users responsible for structural changes.'),
      ]),
      N('Trigger-Based Auditing', 'Detect, capture, store, review.', {}, [
        N('Detect events', 'Detect specified database events.'),
        N('Capture details', 'Capture relevant event details.'),
        N('Store in audit tables', 'Store event information in audit tables.'),
        N('Examine later', 'Support later examination of database activity.'),
      ]),
    ]),
    N('Oracle Auditing', 'Oracle\'s built-in mechanisms for auditing operations and privileges.', {}, [
      N('Auditing Activities', 'Built-in mechanisms for auditing database operations.', {
        code: "AUDIT CREATE TABLE BY scott;\nAUDIT SELECT ON emp;",
      }, [
        N('Oracle mechanisms', 'Oracle provides mechanisms for auditing database operations.'),
        N('Track actions', 'Security administrators can track database actions.'),
        N('Investigate', 'Helps investigate unauthorized operations.'),
      ]),
      N('Auditing Privileges', 'Who is changing who can do what.', { code: "AUDIT GRANT ANY PRIVILEGE;" }, [
        N('Permission changes', 'Record changes involving database permissions.'),
        N('Who granted', 'Examine users granting privileges.'),
        N('Suspicious changes', 'Identify potentially unauthorized access changes.'),
      ]),
      N('Reviewing Audit Info', 'Turn recorded events into answers.', { code: "SELECT username, action_name, timestamp\n  FROM dba_audit_trail\n ORDER BY timestamp DESC;" }, [
        N('Examine records', 'Examine audit records.'),
        N('Responsible users', 'Identify users responsible for recorded activities.'),
        N('Timestamps and ops', 'Review timestamps and relevant database operations.'),
        N('Security analysis', 'Use findings for security analysis.'),
      ]),
    ]),
    N('SQL Server Auditing', 'Monitoring and trigger-based change tracking in SQL Server.', {}, [
      N('SQL Server Monitoring', 'Tracking operations and keeping records.', {}, [
        N('Track operations', 'Track database operations and changes.'),
        N('Investigate events', 'Investigate security-related events.'),
        N('Keep records', 'Maintain records for auditing requirements.'),
      ]),
      N('SQL Server Triggers', 'Fire automatically on data modification events.', {
        code: "CREATE TRIGGER trg_emp_audit\nON emp AFTER INSERT, UPDATE, DELETE\nAS\n  INSERT INTO emp_audit(changed_at, who)\n  VALUES (GETDATE(), SUSER_SNAME());",
      }, [
        N('Automatic', 'Triggers execute automatically in response to specified database events.'),
        N('INSERT', 'Records are added.'),
        N('UPDATE', 'Existing records are modified.'),
        N('DELETE', 'Records are removed.'),
      ]),
      N('Trigger Change Tracking', 'A repeatable four-step pattern.', {}, [
        N('Create triggers', 'Create triggers for relevant tables.'),
        N('Record events', 'Record data modification events.'),
        N('Audit tables', 'Maintain audit tables.'),
        N('Review', 'Review recorded information when investigating changes.'),
      ]),
      N('SQL Server 2000 Auditing', 'Auditing as it existed in SQL Server 2000.', {}, [
        N('Activity monitoring', 'Database activity monitoring in SQL Server 2000.'),
        N('Server events', 'Examination of server-related events.'),
        N('Support security', 'Use of auditing mechanisms to support database security.'),
      ]),
    ]),
    N('Case Study: Security & Auditing', 'A project that joins Unit III controls and Unit IV evidence.', { diagram: 'pipeline' }, [
      N('Problem', 'The requirements the application must satisfy.', {}, [
        N('Requirements', 'A database application must satisfy security and auditing requirements.'),
        N('Designers', 'Developers and DBAs must design suitable controls.'),
        N('Standards', 'Auditing must support organizational and industry requirements.'),
      ]),
      N('Security Design', 'Decide what to protect and from whom.', {}, [
        N('Sensitive data', 'Identify sensitive data.'),
        N('Permissions', 'Define user permissions.'),
        N('Controls', 'Establish database security controls.'),
        N('Restrict operations', 'Restrict unauthorized operations.'),
      ]),
      N('Auditing Design', 'Decide what evidence to keep.', {}, [
        N('What to record', 'Identify which activities must be recorded.'),
        N('Mechanisms', 'Select suitable auditing mechanisms.'),
        N('Audit trails', 'Create audit trails.'),
        N('Preserve', 'Preserve audit information for review.'),
      ]),
      N('Implementation', 'Build it on Oracle or SQL Server.', {}, [
        N('Platform', 'Implement using Oracle or SQL Server.'),
        N('Security features', 'Configure appropriate database security features.'),
        N('Auditing', 'Implement auditing mechanisms.'),
        N('Test capture', 'Test whether activities are captured correctly.'),
      ]),
      N('Evaluation', 'Prove it works and meets the objectives.', {}, [
        N('Restrictions work', 'Verify that access restrictions work.'),
        N('Changes recorded', 'Confirm relevant changes are recorded.'),
        N('Examine audit info', 'Examine audit information.'),
        N('Meets objectives?', 'Determine whether the implementation meets the auditing objectives.'),
      ]),
    ]),
  ],
};

const BRIDGE = {
  left: {
    title: 'Unit III: Control',
    sub: 'What users are allowed to do',
    points: ['Authentication establishes identity', 'Authorization decides permitted operations', 'Roles and functions control application access', 'VPD restricts visible data', 'Row and column controls protect sensitive information'],
  },
  right: {
    title: 'Unit IV: Record',
    sub: 'What users actually did',
    points: ['Auditing records database operations', 'Audit trails preserve event history', 'Triggers capture specified changes', 'Oracle and SQL Server provide auditing mechanisms', 'Audit reports evaluate security and compliance'],
  },
};

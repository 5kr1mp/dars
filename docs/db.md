## 1. Geographical Data

### `barangay`
Stores information about the local administrative divisions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AI | Unique identifier. |
| `barangay_name` | VARCHAR(100) | UNIQUE, NOT NULL | Name of the barangay. |
| `latitude` | DECIMAL(10,8) | CHECK (-90 to 90) | GPS Latitude coordinate. |
| `longitude` | DECIMAL(11,8) | CHECK (-180 to 180) | GPS Longitude coordinate. |
| `radius` | DECIMAL(10,2) | | Coverage radius. |

---

## 2. User Management

### `staff`
Records for system administrators and operators.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AI | Unique identifier. |
| `email` | VARCHAR(60) | UNIQUE, NOT NULL | Login email address. |
| `password` | VARCHAR(255) | NOT NULL | Hashed password. |
| `first_name` | VARCHAR(20) | NOT NULL | Staff first name. |
| `middle_name` | VARCHAR(15) | | Staff middle name. |
| `last_name` | VARCHAR(15) | NOT NULL | Staff last name. |
| `user_role` | ENUM | NOT NULL | `system_admin`, `admin`, `operator`. |
| `contact_number`| VARCHAR(15) | | Personal contact info. |
| `created_at` | TIMESTAMP | DEFAULT NOW | Account creation timestamp. |

---

## 3. Stakeholders

### `victim`
Information regarding the person reporting or affected by the incident.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AI | Unique identifier. |
| `first_name` | VARCHAR(20) | NOT NULL | |
| `last_name` | VARCHAR(15) | NOT NULL | |
| `contact_number`| VARCHAR(20) | | Required if email is null. |
| `email` | VARCHAR(60) | UNIQUE, CHECK | Required if contact is null. |
| `barangay_id` | INT | FK | References `barangay(id)`. |
| `address` | VARCHAR(255) | | Detailed address. |

### `offender`
Information regarding the person alleged to have committed the act.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AI | Unique identifier. |
| `first_name` | VARCHAR(20) | NOT NULL | |
| `sex` | ENUM | | `male`, `female`, `other`. |
| `barangay_id` | INT | FK | References `barangay(id)`. |

### `responder`
Agencies or individuals responsible for responding to reports.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK, AI | Unique identifier. |
| `responder_name`| VARCHAR(100) | NOT NULL | Name of the person or unit. |
| `agency` | VARCHAR(100) | | Agency name (e.g., PNP, BFP). |

---

## 4. Reporting & Dispatch

### `abuse_type`
A lookup table for categorizing types of abuse.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `abuse_name` | VARCHAR(20) | PK | Primary identifier (e.g., 'Physical'). |
| `severity` | TINYINT | NOT NULL | Numeric scale of severity. |
| `law_reference` | VARCHAR(50) | | Legal code/article reference. |

### `report`
The core table containing incident details.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | CHAR(36) | PK (UUID) | Unique identifier for the report. |
| `victim_id` | INT | FK, NOT NULL | Link to victim. |
| `abuse_name` | VARCHAR(20) | FK, NOT NULL | Link to abuse type. |
| `report_status` | ENUM | DEFAULT 'Reported' | `Reported`, `Dispatched`, etc. |
| `latitude` | DECIMAL | CHECK | Precise incident location. |

### `dispatch`
Tracks the assignment of responders to specific reports.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `report_id` | CHAR(36) | FK, NOT NULL | The report being handled. |
| `responder_id` | INT | FK, NOT NULL | The assigned responder. |
| `dispatch_status`| ENUM | | `Assigned`, `On The Way`, etc. |

### `resolved_report`
Final resolution details for a report.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `report_id` | CHAR(36) | PK, FK | Link to the report. |
| `operator_id` | INT | FK | Staff member who resolved it. |
| `resolution_summary`| TEXT | | Closing remarks/summary. |

---

## 5. System Logs & History

### `report_status_history`
Audit trail for changes in a report's status.

### `audit_log`
General system audit log for data changes.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `action_type` | ENUM | NOT NULL | `INSERT`, `UPDATE`, `DELETE`. |
| `old_values` | JSON | | Previous state of the record. |
| `new_values` | JSON | | New state of the record. |

---

# Other Database Objects

## 1. Helper Functions (`function.sql`)
Utility functions used to standardize data and calculate real-time metrics.

| Function | Parameters | Returns | Description |
| :--- | :--- | :--- | :--- |
| **`fn_full_name`** | `p_first` (VAR20), `p_middle` (VAR15), `p_last` (VAR15) | `VARCHAR(60)` | Concatenates names into a standard format: `First [M.] Last`. |
| **`fn_report_age_days`** | `p_reported_at` (DATETIME) | `INT` | Calculates the number of days since the report was filed. |
| **`fn_severity_label`** | `p_severity` (TINYINT) | `VARCHAR(20)` | Maps numeric severity (1-10) to labels: Low, Moderate, High, Critical. |
| **`fn_dispatch_count`** | `p_report_id` (CHAR36) | `INT` | Counts all responder dispatches associated with a specific report. |
| **`fn_barangay_report_count`** | `p_barangay_id` (INT) | `INT` | Counts the number of active (unresolved) reports within a specific barangay. |

---

## 2. Data Views (`view.sql`)
Views aggregate and format raw data for frontend display and reporting.

### Core Data Views
- **`vw_barangay`**
    - **Columns**: `barangay_id`, `barangay_name`, `latitude`, `longitude`, `radius`, `open_report_count`.
    - **Logic**: Joins the barangay table with a count of active reports using `fn_barangay_report_count`.
- **`vw_staff`**
    - **Columns**: `staff_id`, `full_name`, `email`, `user_role`, `contact_number`, `created_at`.
    - **Logic**: Formats names using `fn_full_name` and excludes sensitive fields like passwords.
- **`vw_victim` / `vw_offender`**
    - **Columns**: `[entity]_id`, `full_name`, `contact_number`, `email`, `address`, `barangay_name`.
    - **Logic**: Joins person records with the `barangay` table to display location names instead of IDs.

### Operational Views
- **`vw_report`**
    - **Columns**: `report_id`, `report_status`, `reported_at`, `age_days`, `victim_name`, `offender_name`, `abuse_name`, `severity_label`, `barangay_name`, `latitude`, `longitude`.
    - **Logic**: The central incident view; joins victims, offenders, and abuse types to provide a full snapshot.
- **`vw_dispatch`**
    - **Columns**: `dispatch_id`, `dispatch_status`, `dispatch_time`, `report_id`, `barangay_name`, `responder_name`, `agency`.
    - **Logic**: Links dispatches to their respective reports and responder details.
- **`vw_resolved_report`**
    - **Columns**: `report_id`, `resolved_at`, `operator_name`, `resolution_summary`.
    - **Logic**: Provides historical data on closed cases.

### Monitoring Views
- **`vw_audit_log`**
    - **Columns**: `log_id`, `action_timestamp`, `table_name`, `action_type`, `record_id`, `performed_by`, `user_role`, `old_values`, `new_values`.
    - **Logic**: Joins logs with the `staff` table to show accountability for every data change.

---

## 3. Stored Procedures (`procedure.sql`)
Procedures handle the logic for creating and updating records securely.

### Incident Management
- **`sp_report_create`**
    - **Params**: `p_victim_id`, `p_offender_id`, `p_abuse_name`, `p_barangay_id`, `p_latitude`, `p_longitude`, `p_report_description`.
    - **Action**: Inserts a new report and returns the `new_report_id`.
- **`sp_report_update_status`**
    - **Params**: `p_id` (CHAR36), `p_new_status` (ENUM), `p_staff_id` (INT).
    - **Action**: Updates report status and manually inserts a record into the audit log.
- **`sp_dispatch_create`**
    - **Params**: `p_report_id`, `p_responder_id`, `p_remarks`.
    - **Action**: Creates a new dispatch assignment.

### Administration
- **`sp_staff_create`**
    - **Params**: `p_email`, `p_password`, `p_first_name`, `p_middle_name`, `p_last_name`, `p_user_role`, `p_contact_number`.
- **`sp_audit_log_get`**
    - **Params**: `p_table_name`, `p_action_type`, `p_limit`.
    - **Action**: Retrieves filtered records from the human-readable audit view.

---

## 4. Automation Triggers (`trigger.sql`)
Automated rules that maintain data integrity and workflow progression.

### Workflow Logic
- **`trg_dispatch_after_insert`**: Moves a report to **'Dispatched'** when a responder is assigned.
- **`trg_dispatch_after_update`**: Sets a report to **'Under Investigation'** once a responder marks their dispatch status as 'Completed'.
- **`trg_resolved_report_after_insert`**: Automatically sets the parent report to **'Resolved'** when a summary is saved.
- **`trg_resolved_report_after_delete`**: Reverts a report's status to **'Under Investigation'** if the resolution record is removed.

### Audit Trail (JSON Logging)
Every table (Barangay, Victim, Offender, Report, etc.) has `AFTER INSERT`, `AFTER UPDATE`, and `AFTER DELETE` triggers. 
- They capture `old_values` and `new_values` as **JSON objects**.
- All changes are stored in a central `audit_log` table for compliance and history.

---

## 5. Performance Optimization (`index.sql`)
Indexes are applied to frequently filtered and joined columns.

| Table | Index Columns | Purpose |
| :--- | :--- | :--- |
| **`report`** | `report_status`, `reported_at`, `barangay_id` | Speeds up dashboard filtering and spatial queries. |
| **`dispatch`** | `report_id`, `dispatch_status`, `dispatch_time` | Optimizes tracking of responders. |
| **`audit_log`** | `table_name`, `action_timestamp` | Ensures fast search within history logs. |
| **`barangay`** | `barangay_name` | Speeds up text-based searches for locations. |
| **`abuse_type`** | `severity` | Optimizes prioritization logic. |

## SQL Source
```sql
-- Full SQL script as provided in source
-- (Standard MySQL/MariaDB syntax)
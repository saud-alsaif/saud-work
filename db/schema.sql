-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PERSISTENT TEMPLATE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS task_sections (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL CHECK (trim(name) <> ''),
    display_order INTEGER     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id           UUID        NOT NULL
                             REFERENCES task_sections (id) ON DELETE CASCADE,
    title                TEXT        NOT NULL CHECK (trim(title) <> ''),
    type                 TEXT        NOT NULL CHECK (type IN ('core', 'bonus')),
    bonus_weight         INTEGER     CHECK (
                             (type = 'bonus' AND bonus_weight IS NOT NULL AND bonus_weight BETWEEN 1 AND 100)
                             OR
                             (type = 'core' AND bonus_weight IS NULL)
                         ),
    is_weekday_template  BOOLEAN     NOT NULL DEFAULT false,
    is_weekend_template  BOOLEAN     NOT NULL DEFAULT false,
    display_order        INTEGER     NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_section_id ON tasks (section_id);

CREATE TABLE IF NOT EXISTS projects (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL CHECK (trim(name) <> ''),
    description   TEXT,
    category      TEXT,
    status        TEXT        NOT NULL DEFAULT 'planning'
                      CHECK (status IN ('progress', 'planning')),
    progress_pct  INTEGER     NOT NULL DEFAULT 0
                      CHECK (progress_pct BETWEEN 0 AND 100),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS strategic_focus_items (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL CHECK (trim(name) <> ''),
    icon          TEXT        NOT NULL DEFAULT '',
    color         TEXT        NOT NULL DEFAULT '#10b981'
                      CHECK (color ~ '^#[0-9a-fA-F]{6}$'),
    value_pct     INTEGER     NOT NULL DEFAULT 0
                      CHECK (value_pct BETWEEN 0 AND 100),
    display_order INTEGER     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS goals (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_type     TEXT           NOT NULL CHECK (goal_type IN ('legacy', 'objectives2026')),
    title         TEXT           NOT NULL CHECK (trim(title) <> ''),
    description   TEXT,
    target_value  NUMERIC(15, 4) NOT NULL,
    current_value NUMERIC(15, 4) NOT NULL DEFAULT 0,
    progress_pct  NUMERIC(6, 2)  GENERATED ALWAYS AS (
                      CASE
                          WHEN target_value = 0 THEN 0
                          ELSE LEAST((current_value / target_value) * 100, 100)
                      END
                  ) STORED,
    linked_sector TEXT           CHECK (linked_sector IN (
                      'career', 'finance', 'health',
                      'spirituality', 'social', 'cultural', 'recreation'
                  )),
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_type ON goals (goal_type);

CREATE TABLE IF NOT EXISTS knowledge_items (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type         TEXT        NOT NULL CHECK (type IN ('quote', 'book', 'note')),

    -- quote
    quote_text   TEXT,
    quote_author TEXT,

    -- book
    book_title   TEXT,
    book_author  TEXT,
    book_status  TEXT        CHECK (book_status IN ('reading', 'completed')),

    -- note
    note_title   TEXT,
    note_content TEXT,

    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_quote_fields CHECK (
        type <> 'quote' OR (quote_text IS NOT NULL AND trim(quote_text) <> '')
    ),
    CONSTRAINT chk_book_fields CHECK (
        type <> 'book' OR (
            book_title  IS NOT NULL AND trim(book_title)  <> '' AND
            book_author IS NOT NULL AND trim(book_author) <> '' AND
            book_status IS NOT NULL
        )
    ),
    CONSTRAINT chk_note_fields CHECK (
        type <> 'note' OR (
            note_title   IS NOT NULL AND trim(note_title)  <> '' AND
            note_content IS NOT NULL
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_items (type);

-- ============================================================
-- DATE-SPECIFIC TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_snapshots (
    snapshot_date            DATE          PRIMARY KEY,

    -- Main KPI metrics
    productivity_pct         INTEGER       NOT NULL DEFAULT 0
                                 CHECK (productivity_pct BETWEEN 0 AND 100),
    projects_pct             INTEGER       NOT NULL DEFAULT 0
                                 CHECK (projects_pct BETWEEN 0 AND 100),
    satisfaction_pts         NUMERIC(6,2)  NOT NULL DEFAULT 0
                                 CHECK (satisfaction_pts >= 0),
    week_tracker_pct         INTEGER       NOT NULL DEFAULT 0
                                 CHECK (week_tracker_pct BETWEEN 0 AND 100),

    -- Business Wheel (7 dimensions)
    wheel_career             INTEGER       NOT NULL DEFAULT 0 CHECK (wheel_career BETWEEN 0 AND 100),
    wheel_finance            INTEGER       NOT NULL DEFAULT 0 CHECK (wheel_finance BETWEEN 0 AND 100),
    wheel_health             INTEGER       NOT NULL DEFAULT 0 CHECK (wheel_health BETWEEN 0 AND 100),
    wheel_spirituality       INTEGER       NOT NULL DEFAULT 0 CHECK (wheel_spirituality BETWEEN 0 AND 100),
    wheel_social             INTEGER       NOT NULL DEFAULT 0 CHECK (wheel_social BETWEEN 0 AND 100),
    wheel_cultural           INTEGER       NOT NULL DEFAULT 0 CHECK (wheel_cultural BETWEEN 0 AND 100),
    wheel_recreation         INTEGER       NOT NULL DEFAULT 0 CHECK (wheel_recreation BETWEEN 0 AND 100),
    wheel_avg_score          NUMERIC(5,2)  GENERATED ALWAYS AS (
                                 ROUND(
                                     (wheel_career + wheel_finance + wheel_health
                                      + wheel_spirituality + wheel_social
                                      + wheel_cultural + wheel_recreation)::NUMERIC / 7, 2
                                 )
                             ) STORED,

    -- Health Metrics
    health_water_liters      NUMERIC(4,2)  NOT NULL DEFAULT 0 CHECK (health_water_liters >= 0),
    health_workout_minutes   INTEGER       NOT NULL DEFAULT 0 CHECK (health_workout_minutes >= 0),
    health_sleep_hours       NUMERIC(4,2)  NOT NULL DEFAULT 0 CHECK (health_sleep_hours >= 0),
    health_nutrition_score   INTEGER       NOT NULL DEFAULT 0 CHECK (health_nutrition_score BETWEEN 0 AND 150),
    health_overall_score     NUMERIC(5,2)  NOT NULL DEFAULT 0 CHECK (health_overall_score BETWEEN 0 AND 100),

    -- Computed daily satisfaction score (written by app from task completions)
    daily_satisfaction_score NUMERIC(6,2)  NOT NULL DEFAULT 0 CHECK (daily_satisfaction_score >= 0),

    created_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date ON daily_snapshots (snapshot_date DESC);

CREATE TABLE IF NOT EXISTS task_completions (
    snapshot_date DATE    NOT NULL
                      REFERENCES daily_snapshots (snapshot_date) ON DELETE CASCADE,
    task_id       UUID    NOT NULL
                      REFERENCES tasks (id) ON DELETE CASCADE,
    completed     BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (snapshot_date, task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_completions_date ON task_completions (snapshot_date);
CREATE INDEX IF NOT EXISTS idx_task_completions_task ON task_completions (task_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON task_sections
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON projects
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON strategic_focus_items
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON goals
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON daily_snapshots
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

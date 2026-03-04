-- CreateTable
CREATE TABLE "task_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "task_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "section_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "bonus_weight" INTEGER,
    "is_weekday_template" BOOLEAN NOT NULL DEFAULT false,
    "is_weekend_template" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_snapshots" (
    "snapshot_date" DATE NOT NULL,
    "productivity_pct" INTEGER NOT NULL DEFAULT 0,
    "projects_pct" INTEGER NOT NULL DEFAULT 0,
    "satisfaction_pts" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "week_tracker_pct" INTEGER NOT NULL DEFAULT 0,
    "wheel_career" INTEGER NOT NULL DEFAULT 0,
    "wheel_finance" INTEGER NOT NULL DEFAULT 0,
    "wheel_health" INTEGER NOT NULL DEFAULT 0,
    "wheel_spirituality" INTEGER NOT NULL DEFAULT 0,
    "wheel_social" INTEGER NOT NULL DEFAULT 0,
    "wheel_cultural" INTEGER NOT NULL DEFAULT 0,
    "wheel_recreation" INTEGER NOT NULL DEFAULT 0,
    "health_water_liters" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "health_workout_minutes" INTEGER NOT NULL DEFAULT 0,
    "health_sleep_hours" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "health_nutrition_score" INTEGER NOT NULL DEFAULT 0,
    "health_overall_score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "daily_satisfaction_score" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_snapshots_pkey" PRIMARY KEY ("snapshot_date")
);

-- CreateTable
CREATE TABLE "task_completions" (
    "snapshot_date" DATE NOT NULL,
    "task_id" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "task_completions_pkey" PRIMARY KEY ("snapshot_date","task_id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "strategic_focus_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#10b981',
    "value_pct" INTEGER NOT NULL DEFAULT 0,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "strategic_focus_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "goal_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_value" DECIMAL(15,4) NOT NULL,
    "current_value" DECIMAL(15,4) NOT NULL DEFAULT 0,
    "linked_sector" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "quote_text" TEXT,
    "quote_author" TEXT,
    "book_title" TEXT,
    "book_author" TEXT,
    "book_status" TEXT,
    "note_title" TEXT,
    "note_content" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "task_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_snapshot_date_fkey" FOREIGN KEY ("snapshot_date") REFERENCES "daily_snapshots"("snapshot_date") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_completions" ADD CONSTRAINT "task_completions_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `audio_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`vocabulary_id` text,
	`audio_type` text DEFAULT 'none' NOT NULL,
	`audio_source` text,
	`audio_url` text,
	`license` text,
	`attribution` text,
	`verified` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`vocabulary_id`) REFERENCES `vocabulary_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `cultural_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`category` text,
	`review_status` text DEFAULT 'draft' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vocabulary_items` (
	`id` text PRIMARY KEY NOT NULL,
	`lakota` text NOT NULL,
	`english` text NOT NULL,
	`part_of_speech` text,
	`phonetic_guide` text,
	`ipa` text,
	`category` text,
	`cultural_note` text,
	`source` text,
	`review_status` text DEFAULT 'draft' NOT NULL,
	`review_notes` text,
	`reviewed_by` text,
	`reviewed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

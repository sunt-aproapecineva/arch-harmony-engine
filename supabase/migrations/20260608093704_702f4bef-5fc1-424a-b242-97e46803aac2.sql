ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_log_type_check
  CHECK (type IN ('login','logout','lesson_complete','lesson_view','exercise_complete','note_saved','quiz_complete','module_view','platform_register'));

ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_log_label_len CHECK (label IS NULL OR char_length(label) <= 500);

ALTER TABLE public.activity_log
  ADD CONSTRAINT activity_log_data_size CHECK (data IS NULL OR pg_column_size(data) <= 8192);
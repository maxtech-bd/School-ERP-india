# Assessment System Schema Design
# Quiz Tool & Test Generator - MongoDB Collections

## 1. Assessments Collection
Stores both quizzes (student self-practice) and tests (teacher-created exams)

```javascript
{
  id: "uuid",
  tenant_id: "string",
  school_id: "string",
  
  // Assessment Type
  type: "quiz" | "test",  // quiz = student practice, test = teacher exam
  
  // Basic Info
  title: "string",
  description: "string",
  
  // Filters
  class_standard: "string",  // e.g., "9", "10", "11"
  subject: "string",         // e.g., "Physics", "Math"
  chapter: "string",
  topic: "string",
  
  // Configuration
  difficulty_level: "easy" | "medium" | "hard",
  total_questions: "number",
  duration_minutes: "number",  // Time limit
  
  // Tags (Learning Dimensions)
  tags: ["Knowledge", "Understanding", "Application", "Reasoning", "Skills"],
  
  // Generation Info
  generated_by: "ai" | "manual",
  created_by: "user_id",
  created_by_name: "string",
  created_by_role: "student" | "teacher" | "admin",
  
  // Scheduling (for tests only)
  is_scheduled: "boolean",
  scheduled_start: "datetime",
  scheduled_end: "datetime",
  
  // Status
  status: "draft" | "published" | "completed" | "archived",
  is_active: "boolean",
  
  // Timestamps
  created_at: "datetime",
  updated_at: "datetime",
  published_at: "datetime"
}
```

## 2. Assessment Questions Collection
Individual questions within an assessment

```javascript
{
  id: "uuid",
  tenant_id: "string",
  school_id: "string",
  
  assessment_id: "uuid",  // Reference to assessment
  
  // Question Content
  question_number: "number",
  question_text: "string",
  question_type: "mcq" | "true_false" | "short_answer" | "long_answer",
  
  // Options (for MCQ/True-False)
  options: [
    { option_id: "A", text: "Option A text" },
    { option_id: "B", text: "Option B text" },
    { option_id: "C", text: "Option C text" },
    { option_id: "D", text: "Option D text" }
  ],
  
  // Correct Answer
  correct_answer: "string",  // For MCQ: "A", for true/false: "true", for text: actual answer
  
  // Metadata
  difficulty_level: "easy" | "medium" | "hard",
  learning_tag: "Knowledge" | "Understanding" | "Application" | "Reasoning" | "Skills",
  subject: "string",
  topic: "string",
  
  // Scoring
  marks: "number",
  
  // Source
  source: "cms" | "ai_generated" | "manual",
  source_qa_id: "uuid",  // If from CMS qa_pairs
  
  created_at: "datetime"
}
```

## 3. Assessment Submissions Collection
Student submission records

```javascript
{
  id: "uuid",
  tenant_id: "string",
  school_id: "string",
  
  assessment_id: "uuid",
  assessment_type: "quiz" | "test",
  
  // Student Info
  student_id: "user_id",
  student_name: "string",
  student_class: "string",
  
  // Submission Details
  started_at: "datetime",
  submitted_at: "datetime",
  time_taken_minutes: "number",
  
  // Answers
  answers: [
    {
      question_id: "uuid",
      question_number: "number",
      student_answer: "string",
      is_correct: "boolean",
      marks_obtained: "number",
      marks_total: "number"
    }
  ],
  
  // Results
  total_marks: "number",
  marks_obtained: "number",
  percentage: "number",
  grade: "string",  // A+, A, B, etc.
  
  // Status
  status: "in_progress" | "submitted" | "graded",
  
  created_at: "datetime",
  graded_at: "datetime"
}
```

## 4. Student Progress Collection
Track student performance over time

```javascript
{
  id: "uuid",
  tenant_id: "string",
  school_id: "string",
  
  student_id: "user_id",
  student_name: "string",
  
  // Subject-wise progress
  subject: "string",
  class_standard: "string",
  
  // Statistics
  quizzes_taken: "number",
  tests_taken: "number",
  
  average_score: "number",
  highest_score: "number",
  lowest_score: "number",
  
  // Tag-wise performance
  tag_performance: {
    "Knowledge": { attempted: 50, correct: 45, percentage: 90 },
    "Understanding": { attempted: 40, correct: 32, percentage: 80 },
    "Application": { attempted: 30, correct: 21, percentage: 70 },
    "Reasoning": { attempted: 20, correct: 12, percentage: 60 },
    "Skills": { attempted: 10, correct: 7, percentage: 70 }
  },
  
  // Recent activity
  last_quiz_date: "datetime",
  last_test_date: "datetime",
  
  updated_at: "datetime"
}
```

## Tag System Integration

Learning Dimensions (Bloom's Taxonomy inspired):

1. **Knowledge** - Recall facts, terms, concepts
2. **Understanding** - Explain ideas, comprehend meaning
3. **Application** - Use knowledge in new situations
4. **Reasoning** - Analyze, evaluate, draw conclusions
5. **Skills** - Problem-solving, practical application

These tags will be:
- Added to existing `qa_pairs` collection in CMS
- Used by AI to generate balanced question sets
- Tracked for student progress analytics

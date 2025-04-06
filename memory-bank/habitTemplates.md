# Habit Templates & Categories

## Matrix Categories

Based on market research and common well-being frameworks, we'll organize habits into four matrix categories:

1. **Physical** 💪

   - Physical health and wellbeing
   - Exercise, nutrition, sleep, etc.

2. **Mental** 🧠

   - Mental acuity and cognitive development
   - Learning, reading, problem-solving, etc.

3. **Emotional** ❤️

   - Emotional wellbeing and relationships
   - Gratitude, socialization, self-care, etc.

4. **Spiritual** ✨
   - Purpose, meaning, and values
   - Meditation, reflection, nature, etc.

## Predefined Habit Templates

### Physical Habits 💪

1. **Exercise**

   - Description: "Stay active with regular physical activity"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 30 minutes
   - Icon: 🏃‍♂️

2. **Drink Water**

   - Description: "Stay hydrated throughout the day"
   - Frequency: Daily
   - Goal Type: Count (glasses)
   - Default Goal: 8 glasses
   - Icon: 💧

3. **Sleep Early**

   - Description: "Get to bed by a consistent time"
   - Frequency: Daily
   - Goal Type: Time
   - Default Goal: 10:30 PM
   - Icon: 😴

4. **Take Vitamins**

   - Description: "Remember daily supplements"
   - Frequency: Daily
   - Goal Type: Completion
   - Icon: 💊

5. **Eat Healthy Meal**
   - Description: "Focus on nutritious food choices"
   - Frequency: Daily
   - Goal Type: Count
   - Default Goal: 3 meals
   - Icon: 🥗

### Mental Habits 🧠

1. **Read**

   - Description: "Expand your mind through reading"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 20 minutes
   - Icon: 📚

2. **Learn New Skill**

   - Description: "Dedicate time to learning something new"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 15 minutes
   - Icon: 🎯

3. **Limit Social Media**

   - Description: "Reduce time spent on social platforms"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: Max 30 minutes
   - Icon: 📱

4. **Brain Puzzles**

   - Description: "Keep your mind sharp with puzzles"
   - Frequency: Daily
   - Goal Type: Completion
   - Icon: 🧩

5. **Language Practice**
   - Description: "Practice a new language"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 10 minutes
   - Icon: 🗣️

### Emotional Habits ❤️

1. **Gratitude Journal**

   - Description: "Write down things you're grateful for"
   - Frequency: Daily
   - Goal Type: Count (items)
   - Default Goal: 3 items
   - Icon: 🙏

2. **Connect with Someone**

   - Description: "Reach out to a friend or family member"
   - Frequency: Daily
   - Goal Type: Completion
   - Icon: 👋

3. **Self-Care Time**

   - Description: "Take time for yourself"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 15 minutes
   - Icon: 🛀

4. **No Complaining**

   - Description: "Practice positive speech"
   - Frequency: Daily
   - Goal Type: Completion
   - Icon: 😊

5. **Act of Kindness**
   - Description: "Do something nice for someone else"
   - Frequency: Daily
   - Goal Type: Completion
   - Icon: ❤️

### Spiritual Habits ✨

1. **Meditation**

   - Description: "Clear your mind and be present"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 10 minutes
   - Icon: 🧘‍♀️

2. **Nature Time**

   - Description: "Spend time in nature"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 20 minutes
   - Icon: 🌳

3. **Reflection**

   - Description: "Reflect on your day and growth"
   - Frequency: Daily
   - Goal Type: Duration (minutes)
   - Default Goal: 5 minutes
   - Icon: 💭

4. **Affirmations**

   - Description: "Practice positive self-talk"
   - Frequency: Daily
   - Goal Type: Count
   - Default Goal: 3 affirmations
   - Icon: ✅

5. **Digital Sunset**
   - Description: "No screens before bed"
   - Frequency: Daily
   - Goal Type: Time
   - Default Goal: 9:00 PM
   - Icon: 🌙

## UI/UX Approach

Based on market research from our Review.MD:

1. **Category-First Approach**

   - Present the four matrix categories first
   - Allow users to select a category to see related habit templates
   - This approach aligns with the "balance across life areas" concept

2. **Template Selection UI**

   - Simple, visual cards for each habit template
   - Show icon, name, and brief description
   - Allow one-tap creation with defaults
   - Option to customize after selection

3. **Custom Habit Creation**
   - Always available as an option after category selection
   - Start by selecting category
   - Then enter custom details

## Implementation Notes

1. **Template Data Structure**

   ```typescript
   interface HabitTemplate {
     id: string;
     name: string;
     description: string;
     category: 'physical' | 'mental' | 'emotional' | 'spiritual';
     frequency: 'daily' | 'weekly' | 'monthly';
     goalType: 'completion' | 'duration' | 'count' | 'time';
     defaultGoalValue?: number;
     defaultGoalUnit?: string;
     icon: string;
     color?: string;
   }
   ```

2. **Database Implications**

   - Add `category` field to Habit model
   - Add `icon` field to Habit model
   - Ensure proper category mapping for matrix scores

3. **UX Considerations**
   - Balance simplicity with customization options
   - Provide visual distinction between categories
   - Allow easy editing of template defaults
   - Ensure clear category identification
   - Use visual elements to clarify purposes

# **App Name**: Med-iTrack

## Core Features:

- Automated Request Creation: Automatically creates study requests by processing uploaded medical orders (PDF/image) and extracting patient information, requested studies (with CUPS codes), and diagnoses using Google Genkit.  Gemini with vision is used as a tool in the Genkit flow.
- Manual Request Creation: Allows users to manually create study requests by entering a patient ID and completing a form with relevant details, including patient information, study details, and diagnosis.
- Study Request Dashboard: Presents a comprehensive dashboard that provides an overview of study requests, including a summary of pending studies by modality and clinical area, and a summary of pending and completed reports.
- Role-Based Access Control: Implements a role-based system that controls user access and permissions, ensuring that users can only perform actions relevant to their role (e.g., Admissionists creating requests, Technologists marking studies as complete, Lecturers generating reports).
- Study Request Table: Displays a detailed table listing all study requests with key information such as status, service, patient details, study details, request date, completion date, and actions (edit, cancel, complete, delete).
- PDF Report Generation: Allows users with appropriate roles to upload PDF reports or generate them from plain text after a study is completed. Generated or uploaded reports are associated with the corresponding study request.
- Real-time status updates: As the study request goes through several stages the interface elements will change (badge will change color, rows might become disabled or not) giving visual cues about what is happening in the flow.

## Style Guidelines:

- Primary color: Yellow (#FFDA51), derived from the original prompt, represents precision, traceability, and clarity. It brings a sense of clinical cleanliness, modernity, and trustworthiness to the medical application. The intention is to invoke the brand concepts of 'Precision you can trace' using color.
- Background color: Light gray (#FAFAFA), a very pale tint of the yellow primary, to ensure a clean, bright and modern interface appropriate to the app’s purpose.
- Accent color: Orange (#FFB047), analogous to yellow, will be used for interactive elements, call-to-action buttons, and important notifications to guide the user's attention without disrupting the calm and professional visual environment.
- Body font: 'Inter', sans-serif, provides a modern, machined, neutral look; very legible.
- Headline font: 'Space Grotesk', sans-serif; used to give a techy, computerized feel, while maintaining legibility.
- Use clean, geometric icons from Lucide to maintain a modern and consistent visual language. Icons should be used sparingly to enhance usability and clarity.
- Implement a clean and structured layout using clear containers, white space, and subtle dividers. The layout should facilitate easy navigation and quick access to information.  Employ a consistent grid system to maintain visual harmony and responsiveness across different screen sizes.
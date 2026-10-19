# Macquires E-Sign Frontend

A comprehensive electronic signature platform built with React.js that enables users to upload, sign, and manage documents digitally with advanced features like templates, team collaboration, and integrations.

## 🚀 Features

### Core Functionality

- **Document Upload & Management**: Upload documents in various formats for electronic signing
- **Electronic Signatures**: Create and place digital signatures with drag-and-drop functionality
- **Template Management**: Create reusable document templates for recurring processes
- **Bulk Document Processing**: Send multiple documents for signatures simultaneously
- **Self-Signature Flow**: Sign your own documents without external signatories

### User Management

- **Team Management**: Create and manage teams with role-based access
- **Department Organization**: Organize users into departments with hierarchical structure
- **User Profiles**: Comprehensive user profile management with authentication
- **Delegation**: Delegate signing authority to other team members

### Advanced Features

- **Multi-language Support**: International support with Arabic and English translations
- **Mobile Responsive**: Optimized for mobile and desktop devices
- **Real-time Comments**: Add and manage comments on documents
- **Audit Trail**: Complete tracking of document activities and signature history
- **Advanced Search**: Filter and search documents, users, and templates by name and email
- **Cobranding**: Customize the platform with organization branding

### Integrations

- **OneDrive Integration**: Connect and sync with Microsoft OneDrive
- **OpenAI Integration**: AI-powered document generation and assistance
- **SMS Integration**: Send notifications via SMS
- **Webhook Integration**: Connect with external systems via webhooks
- **Google Login**: Social authentication support

### Document Status Management

- **Dashboard**: Comprehensive overview of document statuses
- **Pending Management**: Track documents awaiting signatures
- **Completed Documents**: Archive and manage signed documents
- **Draft Management**: Save and continue working on draft documents
- **Declined Documents**: Handle document rejections and modifications

## 🛠 Tech Stack

- **Frontend Framework**: React.js 18+
- **UI Components**: React Bootstrap, PrimeReact
- **Styling**: CSS3, Bootstrap 5
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Internationalization**: react-i18next
- **HTTP Client**: Axios
- **Drag & Drop**: react-beautiful-dnd
- **Phone Input**: react-phone-input-2
- **Notifications**: react-toastify
- **File Handling**: React Dropzone
- **Icons**: React Icons

## 🏗 API Architecture

The project follows a **Service-Oriented Architecture** to handle backend connectivity efficiently:

- **Services**: All API calls are abstracted into service modules located in `src/services/`.
- **Centralized Endpoints**: API routes are defined in `src/Constants/endpoints.js`.
- **Interceptors**: Authentication and session management are handled automatically via `src/Api/apiHandlers.js`.

For a detailed implementation guide on adding new APIs, please refer to [API_STANDARDS.md](./docs/API_STANDARDS.md).

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 14 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Macquires-ESign-FE
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   - Create a `.env` file in the root directory
   - Add necessary environment variables:

   ```env
   REACT_APP_API_BASE_URL=your_api_base_url
   REACT_APP_SITE_KEY_RECAPTCHA_V3=your_reCAPTCHA_v3_site_key
   REACT_APP_ONEDRIVE_CLIENT_ID=your_onedrive_client_id
   REACT_APP_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```
   The application will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── Api/                    # API configuration and axios setup
├── assets/                 # Images, icons, and static assets
├── Components/             # Reusable React components
│   ├── AIAssistant/       # AI-powered assistance features
│   ├── BulkSend/          # Bulk document sending functionality
│   ├── Cobranding/        # Platform customization
│   ├── CreateTeam/        # Team management components
│   ├── DashboardStatuses/ # Document status management
│   ├── EmailTemplates/    # Email template management
│   ├── Folder/            # Document folder organization
│   ├── Layout/            # Application layout components
│   ├── Navbar/            # Navigation components
│   ├── SelfSignature/     # Self-signing workflow
│   ├── Upload Flow/       # Document upload process
│   └── ...               # Other feature components
├── Context/               # React Context for state management
├── Integrations/          # Third-party service integrations
├── Pages/                 # Main application pages
│   ├── Home/             # Dashboard and home page
│   ├── Login/            # Authentication pages
│   ├── Profile/          # User profile management
│   ├── SignaturePage/    # Document signing interface
│   ├── Templates/        # Template management
│   └── ...              # Other main pages
├── Translation/          # Internationalization files
└── index.js             # Application entry point
```

## 🔧 Available Scripts

- **`npm start`**: Run development server
- **`npm test`**: Run test suite
- **`npm run build`**: Build for production
- **`npm run eject`**: Eject from Create React App (one-way operation)

## 🌐 Key Features Usage

### Document Upload & Signing

1. Navigate to Upload Flow
2. Select or drag & drop documents
3. Add signatories with email/SMS notification
4. Place signature fields and form controls
5. Send for signatures

### Template Management

1. Create reusable templates
2. Define recipient roles and signature fields
3. Save for future use
4. Use templates for new documents

### Team Collaboration

1. Create teams and departments
2. Invite team members
3. Assign roles and permissions
4. Delegate signing authority

### Enhanced Search Functionality

- Search team members and external users by **name** or **email**
- Filter users in recipient selection modals
- Real-time search across all user lists

## 🔐 Authentication & Security

- Secure token-based authentication
- Session management with automatic expiry
- Role-based access control
- Password protection for sensitive documents
- Verification methods (SMS, Email, WhatsApp)

## 🌍 Internationalization

The application supports multiple languages:

- English (default)
- Arabic (RTL support)

Language files are located in `src/Translation/`

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly interface
- Mobile-optimized signature placement
- Progressive Web App capabilities

## 🔄 Recent Updates

- **Enhanced User Search**: Users can now search by both name and email in recipient selection
- **Improved Filtering**: Advanced filtering capabilities in Signatories and Template components
- **Integration Updates**: Enhanced OneDrive, OpenAI, and SMS integrations
- **UI Improvements**: Better user experience across all components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you encounter any bugs or issues:

1. Check existing issues first
2. Create a detailed bug report with steps to reproduce
3. Include browser information and error logs
4. Assign appropriate labels

## 📝 License

This project is proprietary software developed by Macquires.

## 📞 Support

For technical support or questions, please contact the development team.

---

<div align="center">
  <p><strong>© 2025 Macquires IT & Business Consultations. All rights reserved.</strong></p>
  <p>Built with ❤️ by the Macquires Development Team</p>
</div>

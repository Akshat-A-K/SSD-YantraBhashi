const API_BASE_URL = 'http://localhost:7979';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User authentication methods
  async signup(userData) {
    return this.request('/user/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signin(credentials) {
    return this.request('/user/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/user/logout', {
      method: 'POST',
    });
  }

  async getUserInfo(userId) {
    return this.request(`/user/${userId}`);
  }

  // Code submission methods
  async validateCode(code) {
    return this.request('/submission', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async getUserSubmissions() {
    return this.request('/submission');
  }

  async verifySubmission(submissionId, feedback = '') {
    return this.request(`/submission/${submissionId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ instructor_feedback: feedback }),
    });
  }

  // Instructor methods (these will need to be added to your backend)
  async getAllStudents() {
    return this.request('/instructor/students');
  }

  async getStudentSubmissions(studentId) {
    return this.request(`/instructor/students/${studentId}/submissions`);
  }

  async getAllSubmissions() {
    return this.request('/instructor/submissions');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

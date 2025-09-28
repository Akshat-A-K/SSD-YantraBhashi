const API_BASE_URL = 'http://localhost:7979';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
  credentials: 'include',
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

  
  async getAllStudents() {
    return this.request('/instructor/students');
  }

  async getStudentSubmissions(studentId) {
    return this.request(`/instructor/students/${studentId}/submissions`);
  }

  async getAllSubmissions() {
    return this.request('/instructor/submissions');
  }

  
  async aiSuggest(code, extra = {}) {
    
    
    const body = { code, ...extra };
    
    
    const resp = await this.request('/ai/correct', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (resp && resp.success && resp.data) return resp.data;
    return resp;
  }
}


const apiService = new ApiService();
export default apiService;

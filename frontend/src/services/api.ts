const API_BASE_URL = 'http://localhost:5000';

// Types
export interface Incident {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'reported' | 'confirmed' | 'resolved' | 'closed';
  source: string;
  created_at: string;
  updated_at?: string;
  published_at?: string;
  url?: string;
  media: MediaFile[];
}

export interface MediaFile {
  id: number;
  media_type: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  caption?: string;
  alt_text?: string;
  thumbnail_url?: string;
  file_url: string;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface CreateIncidentData {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
}

export interface OverviewStats {
  total_incidents: number;
  recent_incidents_24h: number;
  status_breakdown: { status: string; count: number }[];
  category_breakdown: { category: string; count: number }[];
  weekly_trend: { date: string; count: number }[];
}

export interface CategoryStats {
  period_days: number;
  categories: {
    category: string;
    total_count: number;
    resolved_count: number;
    open_count: number;
    resolution_rate: number;
  }[];
}

export interface LocationStats {
  locations: {
    location: string;
    count: number;
    avg_latitude?: number;
    avg_longitude?: number;
  }[];
}

export interface TimelineStats {
  period: string;
  category?: string;
  timeline: { date: string; count: number }[];
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private getHeaders(includeAuth = true, includeContentType = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private getMultipartHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {};

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Incident APIs
  async getIncidents(params?: {
    source?: string;
    category?: string;
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<Incident[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${this.baseURL}/incidents?${searchParams}`, {
      headers: this.getHeaders(false, false),
    });

    return this.handleResponse<Incident[]>(response);
  }

  async getIncident(id: number): Promise<Incident> {
    const response = await fetch(`${this.baseURL}/incidents/${id}`, {
      headers: this.getHeaders(false, false),
    });

    return this.handleResponse<Incident>(response);
  }

  async createIncident(data: CreateIncidentData): Promise<Incident> {
    const response = await fetch(`${this.baseURL}/incidents`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Incident>(response);
  }

  async createIncidentWithMedia(data: CreateIncidentData, mediaFiles: File[]): Promise<Incident> {
    const formData = new FormData();
    
    // Add incident data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Add media files
    mediaFiles.forEach(file => {
      formData.append('media', file);
    });

    const response = await fetch(`${this.baseURL}/incidents`, {
      method: 'POST',
      headers: this.getMultipartHeaders(false),
      body: formData,
    });

    return this.handleResponse<Incident>(response);
  }

  async updateIncident(id: number, data: Partial<CreateIncidentData>): Promise<Incident> {
    const response = await fetch(`${this.baseURL}/incidents/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse<Incident>(response);
  }

  async deleteIncident(id: number): Promise<void> {
    const response = await fetch(`${this.baseURL}/incidents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
  }

  // Authentication APIs
  async register(userData: {
    username: string;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData),
    });

    const authResponse = await this.handleResponse<AuthResponse>(response);
    this.setToken(authResponse.access_token);
    return authResponse;
  }

  async login(credentials: { username: string; password: string }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });

    const authResponse = await this.handleResponse<AuthResponse>(response);
    this.setToken(authResponse.access_token);
    return authResponse;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.clearToken();
    }
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders(),
    });

    return this.handleResponse<{ user: User }>(response);
  }

  async updateProfile(userData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<{ user: User }> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse<{ user: User }>(response);
  }

  // Statistics APIs
  async getOverviewStats(): Promise<OverviewStats> {
    const response = await fetch(`${this.baseURL}/stats/overview`, {
      headers: this.getHeaders(false),
    });

    return this.handleResponse<OverviewStats>(response);
  }

  async getCategoryStats(days?: number): Promise<CategoryStats> {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());

    const response = await fetch(`${this.baseURL}/stats/category?${params}`, {
      headers: this.getHeaders(false),
    });

    return this.handleResponse<CategoryStats>(response);
  }

  async getLocationStats(): Promise<LocationStats> {
    const response = await fetch(`${this.baseURL}/stats/location`, {
      headers: this.getHeaders(false),
    });

    return this.handleResponse<LocationStats>(response);
  }

  async getTimelineStats(period: 'week' | 'month' | 'year', category?: string): Promise<TimelineStats> {
    const params = new URLSearchParams({ period });
    if (category) params.append('category', category);

    const response = await fetch(`${this.baseURL}/stats/timeline?${params}`, {
      headers: this.getHeaders(false),
    });

    return this.handleResponse<TimelineStats>(response);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Helper functions
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('auth_token') !== null;
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isAuthenticated()) return null;
  
  try {
    const response = await apiClient.getProfile();
    return response.user;
  } catch {
    apiClient.clearToken();
    return null;
  }
};

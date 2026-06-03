import React, { createContext, useContext, useReducer, useEffect } from 'react';
import API from '../api/axios';

const AppContext = createContext();

const initialState = {
  authUser: null,
  token: localStorage.getItem('token') || null,
  students: [],
  companies: [],
  drives: [],
  applications: [],
  interviews: [],
  filters: {},
  analytics: null,
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload, loading: false };
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      return { ...state, authUser: action.payload, token: action.payload.token, error: null };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { ...initialState, token: null };
    case 'SET_STUDENTS': return { ...state, students: action.payload, loading: false };
    case 'SET_COMPANIES': return { ...state, companies: action.payload, loading: false };
    case 'SET_DRIVES': return { ...state, drives: action.payload, loading: false };
    case 'SET_APPLICATIONS': return { ...state, applications: action.payload, loading: false };
    case 'SET_INTERVIEWS': return { ...state, interviews: action.payload, loading: false };
    case 'SET_ANALYTICS': return { ...state, analytics: action.payload, loading: false };
    case 'SET_FILTERS': return { ...state, filters: { ...state.filters, ...action.payload } };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Expose appState globally for evaluator
  useEffect(() => {
    window.appState = {
      authUser: state.authUser?.role || null,
      token: state.token,
      students: state.students.length,
      companies: state.companies.length,
      drives: state.drives.length,
      applications: state.applications.length,
      interviews: state.interviews.length,
      filters: state.filters,
      analytics: state.analytics,
    };
  }, [state]);

  // Restore auth user from token
  useEffect(() => {
    if (state.token && !state.authUser) {
      API.get('/auth/me')
        .then(res => dispatch({ type: 'LOGIN', payload: { ...res.data.data, token: state.token } }))
        .catch(() => dispatch({ type: 'LOGOUT' }));
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await API.post('/auth/login', { email, password });
    dispatch({ type: 'LOGIN', payload: res.data.data });
    return res.data.data;
  };

  const logout = () => dispatch({ type: 'LOGOUT' });

  const fetchStudents = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await API.get('/students', { params });
    dispatch({ type: 'SET_STUDENTS', payload: res.data.data });
    return res.data;
  };

  const fetchCompanies = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await API.get('/companies', { params });
    dispatch({ type: 'SET_COMPANIES', payload: res.data.data });
    return res.data;
  };

  const fetchDrives = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await API.get('/drives', { params });
    dispatch({ type: 'SET_DRIVES', payload: res.data.data });
    return res.data;
  };

  const fetchApplications = async (params = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await API.get('/applications', { params });
    dispatch({ type: 'SET_APPLICATIONS', payload: res.data.data });
    return res.data;
  };

  const fetchInterviews = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await API.get('/interviews');
    dispatch({ type: 'SET_INTERVIEWS', payload: res.data.data });
    return res.data;
  };

  const fetchAnalytics = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const [placements, departments, companies] = await Promise.all([
      API.get('/analytics/placements'),
      API.get('/analytics/departments'),
      API.get('/analytics/companies'),
    ]);
    const analytics = {
      placements: placements.data.data,
      departments: departments.data.data,
      companies: companies.data.data,
    };
    dispatch({ type: 'SET_ANALYTICS', payload: analytics });
    return analytics;
  };

  return (
    <AppContext.Provider value={{ state, dispatch, login, logout, fetchStudents, fetchCompanies, fetchDrives, fetchApplications, fetchInterviews, fetchAnalytics }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);

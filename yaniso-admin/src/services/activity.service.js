import api from './api'

class ActivityService {
  async getRecentActivities(limit = 5) {
    try {
      // Call the new activities API endpoint
      const response = await api.get(`/admin/activities?limit=${limit}`);
      
      // Map backend data to frontend format
      return response.data.map(activity => ({
        id: `${activity.type}-${activity.id}`,
        type: activity.type,
        icon: activity.icon || this.getDefaultIcon(activity.type),
        title: activity.title,
        timestamp: activity.created_at,
        timeDisplay: this.getTimeDisplay(activity.created_at),
        description: activity.description,
        data: activity.metadata
      }));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return []; // Return empty array instead of throwing to provide graceful degradation
    }
  }
  
  getDefaultIcon(type) {
    switch(type) {
      case 'client':
        return 'bi bi-person';
      case 'appointment':
        return 'bi bi-calendar';
      case 'service':
        return 'bi bi-scissors';
      default:
        return 'bi bi-lightning';
    }
  }
  
  getTimeDisplay(timestamp) {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    // For older activities, show the date
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return activityTime.toLocaleDateString(undefined, options);
  }
}

export default new ActivityService(); 
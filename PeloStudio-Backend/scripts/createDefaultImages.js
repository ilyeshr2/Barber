#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { FileStorage } = require('../models');
require('dotenv').config();

// Create base64 encoded placeholder images
const defaultBarberImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAP///8zMzJmZmWZmZjMzM+Dg4Kurq4iIiN3d3fn5+f7+/vz8/Pv7+/r6+vj4+Pf39/b29vX19fT09PPz8/Ly8vHx8fDw8O/v7+7u7u3t7ezs7Ovr6+rq6unp6ejo6Ofn5+bm5uXl5eTk5OPj4+Li4uHh4eDg4N/f397e3t3d3dzc3Nvb29ra2tnZ2djY2NfX19bW1tXV1dTU1NPT09LS0tHR0dDQ0M/Pz87Ozs3NzczMzMvLy8rKysnJycjIyMfHx8bGxsXFxcTExMPDw8LCwsHBwcDAwL+/v76+vr29vby8vLu7u7q6urm5ubi4uLe3t7a2trW1tbS0tLOzs7KysrGxsbCwsK+vr66urq2traysrKurq6qqqqmpqaioqKenp6ampqWlpaSkpKOjo6KioqGhoaCgoJ+fn56enp2dnZycnJubm5qampmZmZiYmJeXl5aWlpWVlZSUlJOTk5KSkpGRkZCQkI+Pj46Ojo2NjYyMjIuLi4qKiomJiYiIiIeHh4aGhoWFhYSEhIODg4KCgoGBgYCAgH9/f35+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhoaGdnZ2ZmZmVlZWRkZGNjY2JiYmFhYWBgYF9fX15eXl1dXVxcXFtbW1paWllZWVhYWFdXV1ZWVlVVVVRUVFNTU1JSUlFRUVBQUE9PT05OTk1NTUxMTEtLS0pKSklJSUhISEdHR0ZGRkVFRURERENDQ0JCQkFBQUBAQD8/Pz4+Pj09PTw8PDs7Ozo6Ojk5OTg4ODc3NzY2NjU1NTQ0NDMzMzIyMjExMTAwMC8vLy4uLi0tLSwsLCsrKyoqKikpKSgoKCcnJyYmJiUlJSQkJCMjIyIiIiEhISAgIB8fHx4eHh0dHRwcHBsbGxoaGhkZGRgYGBcXFxYWFhUVFRQUFBMTExISEhERERAQEA8PDw4ODg0NDQwMDAsLCwoKCgkJCQgICAcHBwYGBgUFBQQEBAMDAwICAgEBAQAAACH5BAAAAAAALAAAAAAgACAAAASKsEgAgw3KonDTTHvLepfNuBGi90UjJp5ohKaUDGm8zUK3LLZzr6g3+w2Bwk7xYEwum8be0wGFTq8LqlbL5XKz28H3DGZax+j0es1uu9/wuHxOr9vv+Ly+jt/z/f+AgYKDhIWGhQEHiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+gobgBs7S1tre4ubq7iUEAOw==';
const defaultSalonImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAP///8zMzJmZmWZmZjMzM+Dg4Kurq4iIiN3d3fj4+Pn5+fr6+vv7+/z8/P39/f7+/vX19fb29vf39/T09PPz8/Ly8vHx8fDw8O/v7+7u7u3t7ezs7Ovr6+rq6unp6ejo6Ofn5+bm5uXl5eTk5OPj4+Li4uHh4eDg4N/f397e3t3d3dzc3Nvb29ra2tnZ2djY2NfX19bW1tXV1dTU1NPT09LS0tHR0dDQ0M/Pz87Ozs3NzczMzMvLy8rKysnJycjIyMfHx8bGxsXFxcTExMPDw8LCwsHBwcDAwL+/v76+vr29vby8vLu7u7q6urm5ubi4uLe3t7a2trW1tbS0tLOzs7KysrGxsbCwsK+vr66urq2traysrKurq6qqqqmpqaioqKenp6ampqWlpaSkpKOjo6KioqGhoaCgoJ+fn56enp2dnZycnJubm5qampmZmZiYmJeXl5aWlpWVlZSUlJOTk5KSkpGRkZCQkI+Pj46Ojo2NjYyMjIuLi4qKiomJiYiIiIeHh4aGhoWFhYSEhIODg4KCgoGBgYCAgH9/f35+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhoaGdnZ2ZmZmVlZWRkZGNjY2JiYmFhYWBgYF9fX15eXl1dXVxcXFtbW1paWllZWVhYWFdXV1ZWVlVVVVRUVFNTU1JSUlFRUVBQUE9PT05OTk1NTUxMTEtLS0pKSklJSUhISEdHR0ZGRkVFRURERENDQ0JCQkFBQUBAQD8/Pz4+Pj09PTw8PDs7Ozo6Ojk5OTg4ODc3NzY2NjU1NTQ0NDMzMzIyMjExMTAwMC8vLy4uLi0tLSwsLCsrKyoqKikpKSgoKCcnJyYmJiUlJSQkJCMjIyIiIiEhISAgIB8fHx4eHh0dHRwcHBsbGxoaGhkZGRgYGBcXFxYWFhUVFRQUFBMTExISEhERERAQEA8PDw4ODg0NDQwMDAsLCwoKCgkJCQgICAcHBwYGBgUFBQQEBAMDAwICAgEBAQYMQs8AAAAZdFJOUwABAgMEBQYHCDAwMTIzMz9BUIWM3d7f8P1VHgVIAAAAo0lEQVRo3u3OwQ2AIAwFUIbptIh7uYczuP9G1kMT4vGV5JfQpvkBAACAT9i252G8LWle5ItRA/iVKQA0gHfV/xpXZKrHqx6NAGgAOLI2RzZWDRrKxj4CUAPAgWXZ2MQmEkDZWDWATQPAK+tjY8/G7gQoG6sGvQiABoBuydpkY3OBsvGJANQAUK52SdZsLALKxiYCUANA/9hGNjYCysamAnB/DwCALyf/8wTbC7/JAwAAAABJRU5ErkJggg==';
const defaultLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAP///8zMzJmZmWZmZjMzM+Dg4Kurq4iIiN3d3ZycnKGhoaamprGxsbW1tbu7u7+/v8PDw9PT0+fn5+vr6+/v7/Pz8/f39/v7+5qamgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHpEYrQAAAAZdFJOUwABAgMEBQYHCDAwMTIzMz9BUIWM3d7f8P1VHgVIAAAAo0lEQVRo3u3OwQ2AIAwFUIbptIh7uYczuP9G1kMT4vGV5JfQpvkBAACAT9i252G8LWle5ItRA/iVKQA0gHfV/xpXZKrHqx6NAGgAOLI2RzZWDRrKxj4CUAPAgWXZ2MQmEkDZWDWATQPAK+tjY8/G7gQoG6sGvQiABoBuydpkY3OBsvGJANQAUK52SdZsLALKxiYCUANA/9hGNjYCysamAnB/DwCALyf/8wTbC7/JAwAAAABJRU5ErkJggg==';
const defaultAuthorImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURQAAAP///8zMzJmZmWZmZjMzM+Dg4Kurq4iIiN3d3fj4+Pn5+fr6+vv7+/z8/P39/f7+/vX19fb29vf39/T09PPz8/Ly8vHx8fDw8O/v7+7u7u3t7ezs7Ovr6+rq6unp6ejo6Ofn5+bm5uXl5eTk5OPj4+Li4uHh4eDg4N/f397e3t3d3dzc3Nvb29ra2tnZ2djY2NfX19bW1tXV1dTU1NPT09LS0tHR0dDQ0M/Pz87Ozs3NzczMzMvLy8rKysnJycjIyMfHx8bGxsXFxcTExMPDw8LCwsHBwcDAwL+/v76+vr29vby8vLu7u7q6urm5ubi4uLe3t7a2trW1tbS0tLOzs7KysrGxsbCwsK+vr66urq2traysrKurq6qqqqmpqaioqKenp6ampqWlpaSkpKOjo6KioqGhoaCgoJ+fn56enp2dnZycnJubm5qampmZmZiYmJeXl5aWlpWVlZSUlJOTk5KSkpGRkZCQkI+Pj46Ojo2NjYyMjIuLi4qKiomJiYiIiIeHh4aGhoWFhYSEhIODg4KCgoGBgYCAgH9/f35+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhoaGdnZ2ZmZmVlZWRkZGNjY2JiYmFhYWBgYF9fX15eXl1dXVxcXFtbW1paWllZWVhYWFdXV1ZWVlVVVVRUVFNTU1JSUlFRUVBQUE9PT05OTk1NTUxMTEtLS0pKSklJSUhISEdHR0ZGRkVFRURERENDQ0JCQkFBQUBAQD8/Pz4+Pj09PTw8PDs7Ozo6Ojk5OTg4ODc3NzY2NjU1NTQ0NDMzMzIyMjExMTAwMC8vLy4uLi0tLSwsLCsrKyoqKikpKSgoKCcnJyYmJiUlJSQkJCMjIyIiIiEhISAgIB8fHx4eHh0dHRwcHBsbGxoaGhkZGRgYGBcXFxYWFhUVFRQUFBMTExISEhERERAQEA8PDw4ODg0NDQwMDAsLCwoKCgkJCQgICAcHBwYGBgUFBQQEBAMDAwICAgEBAQYMQs8AAAAZdFJOUwABAgMEBQYHCDAwMTIzMz9BUIWM3d7f8P1VHgVIAAAClklEQVRo3u3aCW/aQBAF4AesMS4GnAARh0O4CTTEIeAcBHI0OUr+/3+prbTSSrtjB8uu1XL7e39gr7SaHc2aKSIAAAAAAAC4Vk3DsKrY2TFMQ1MPv8Qjot7MjtO46RFZhmYYRJrZrTjJ6OEMQzs5BLZnakTaScH37ZIdz5bzjcKFg2/FzuUbpbJd6lhPYe0C2PZ8/6HmElGh7Dnh486n5f/BqXCF9+xRIZM9JX1wrh6FIKwFoTAKHI/9rsfvHZzs8LKLJ/Gzys+NeLrGNl5l2AyY0uyU0t3NUZQ9e/KxnMmRRSc1OPQXBDyeBK5EO0sKpZwJfzvh/STJIQlE/maSNOHXa+Aod5LuUbIJSNj05ykC/oDI4Q8TCT1ZV5qA3xiGrqwrTcB/7Qeu5EslHWkCfsxPwtCVdWU9eQLrY+BIn65IAaGAUEAoIBQQCggFLiDAT73qyNakAkLgiw50SQXEdxUdfm9rMgHpzUpxpf9ePqDnJLYGu4BkTdS3kvBJ+W8T+M9YqxZMIvkf3Vdyid3KAAAAAAAAAJmptjur1WrVWaS23vQyFGi1Ou/GZzecvr+vU1t4PJjN0vY0/YdL+8y6U3dbaTXTdqo3o+/G7/eXQ6ppw4fTY22nDJeDrATa+9lqeNdXkL35m7u5W1XRzEXgYd6dR9WPnIJxf/X4+fHpvf/YzbkI9Ad3H/ej10+vPz+++vjRG6y7ORd5nC1X08/F5tuXfHe5nM16ORcZrQermgIRkcdNf/ZFfU5wI2DZk3UVZCsglA4DBYQCQgGhQCog+aFEYYGCAgIFBQQKhiGFk5jCUVThMK5wHJlbQOlARulESulIVu1QGgAAAAAAAMBV+gVpDI48D67YDAAAAABJRU5ErkJggg==';

// Set up directories
const setupDirectories = () => {
  const rootDir = path.join(__dirname, '../');
  const uploadDir = path.join(rootDir, 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const directories = ['barbers', 'salon', 'publications', 'users', 'misc'];
  directories.forEach(dir => {
    if (!fs.existsSync(path.join(uploadDir, dir))) {
      fs.mkdirSync(path.join(uploadDir, dir), { recursive: true });
    }
  });
  
  console.log('Upload directories created successfully');
  return uploadDir;
};

// Write base64 to a file
const writeBase64ToFile = (base64Data, filePath) => {
  // Remove the data URL prefix (e.g., "data:image/png;base64,")
  const data = base64Data.split(',')[1];
  const buffer = Buffer.from(data, 'base64');
  fs.writeFileSync(filePath, buffer);
  return filePath;
};

// Create and store default images
const createDefaultImages = async () => {
  try {
    const uploadDir = setupDirectories();
    
    // Create default barber image
    const barberImagePath = path.join(uploadDir, 'barbers', 'default-barber.jpg');
    writeBase64ToFile(defaultBarberImageBase64, barberImagePath);
    console.log(`Created default barber image at ${barberImagePath}`);
    
    // Create default salon image
    const salonImagePath = path.join(uploadDir, 'salon', 'default-salon.jpg');
    writeBase64ToFile(defaultSalonImageBase64, salonImagePath);
    console.log(`Created default salon image at ${salonImagePath}`);
    
    // Create default logo
    const logoPath = path.join(uploadDir, 'salon', 'default-logo.png');
    writeBase64ToFile(defaultLogoBase64, logoPath);
    console.log(`Created default logo at ${logoPath}`);
    
    // Create default author image
    const authorImagePath = path.join(uploadDir, 'publications', 'default-author.jpg');
    writeBase64ToFile(defaultAuthorImageBase64, authorImagePath);
    console.log(`Created default author image at ${authorImagePath}`);
    
    // Store in database if not already there
    await storeDefaultImagesInDB();
    
    console.log('Default images created successfully');
  } catch (error) {
    console.error('Error creating default images:', error);
  }
};

// Store default images in the database
const storeDefaultImagesInDB = async () => {
  try {
    // Check if default barber image exists in DB
    const barberImage = await FileStorage.findOne({
      where: { file_path: '/uploads/barbers/default-barber.jpg' }
    });
    
    if (!barberImage) {
      await FileStorage.create({
        original_name: 'default-barber.jpg',
        file_path: '/uploads/barbers/default-barber.jpg',
        file_size: 1024, // Placeholder size
        mime_type: 'image/jpg',
        category: 'barbers',
        upload_date: new Date()
      });
      console.log('Default barber image stored in database');
    }
    
    // Check if default salon image exists in DB
    const salonImage = await FileStorage.findOne({
      where: { file_path: '/uploads/salon/default-salon.jpg' }
    });
    
    if (!salonImage) {
      await FileStorage.create({
        original_name: 'default-salon.jpg',
        file_path: '/uploads/salon/default-salon.jpg',
        file_size: 1024, // Placeholder size
        mime_type: 'image/jpg',
        category: 'salon',
        upload_date: new Date()
      });
      console.log('Default salon image stored in database');
    }
    
    // Check if default logo exists in DB
    const logoImage = await FileStorage.findOne({
      where: { file_path: '/uploads/salon/default-logo.png' }
    });
    
    if (!logoImage) {
      await FileStorage.create({
        original_name: 'default-logo.png',
        file_path: '/uploads/salon/default-logo.png',
        file_size: 1024, // Placeholder size
        mime_type: 'image/png',
        category: 'salon',
        upload_date: new Date()
      });
      console.log('Default logo stored in database');
    }
    
    // Check if default author image exists in DB
    const authorImage = await FileStorage.findOne({
      where: { file_path: '/uploads/publications/default-author.jpg' }
    });
    
    if (!authorImage) {
      await FileStorage.create({
        original_name: 'default-author.jpg',
        file_path: '/uploads/publications/default-author.jpg',
        file_size: 1024, // Placeholder size
        mime_type: 'image/jpg',
        category: 'publications',
        upload_date: new Date()
      });
      console.log('Default author image stored in database');
    }
    
    console.log('All default images stored in database');
  } catch (error) {
    console.error('Error storing default images in database:', error);
  }
};

// Run the main function
createDefaultImages(); 
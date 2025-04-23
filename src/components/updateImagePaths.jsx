import logo from '../assets/logo.png';
import userProfileImg from '../assets/userProfile.jpeg';

// Function to update image paths in the HTML
export function updateImagePaths() {
  // Update logo image
  const logoImg = document.querySelector('.navbar-brand img');
  if (logoImg) {
    logoImg.src = logo;
  }

  // Update profile image
  const profileImg = document.getElementById('profile-image');
  if (profileImg) {
    profileImg.src = userProfileImg;
  }
}
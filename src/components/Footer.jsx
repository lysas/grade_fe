
// import React from 'react';
// import { FaYoutube, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";
// import './Footer.css';
// import logo from '../assets/logo.png';

// const Footer = () => {
//   return (
//     <footer className="footer">
//       <div className="footer-main">
//         <div className="footer-content">
//           <div className="footer-column brand-column">
//             <a href="#" className="navbar-brand">
//               <img src={logo} alt="Company Logo" className="img-fluid" />
//             </a>
//             <p className="text-muted" style={{ marginTop: "6px" }}>
//               AI-Powered Solutions for the Education industry
//             </p>
//             <div className="social-icons">
//               <FaYoutube className="upload-icon1" data-testid="youtube-icon" />
//               <FaTwitter className="upload-icon1" data-testid="twitter-icon" />
//               <FaInstagram className="upload-icon1" data-testid="instagram-icon" />
//               <FaFacebook className="upload-icon1" data-testid="facebook-icon" />
//             </div>
//           </div>

//           <div className="footer-column">
//             <h5>Company</h5>
//             <ul className="list-unstyled mb-0">
//               <li><a href="#" className="text-muted">About Us</a></li>
//               <li><a href="#" className="text-muted">Features</a></li>
//               <li><a href="#" className="text-muted">Products</a></li>
//               <li><a href="#" className="text-muted">Services</a></li>
//               <li><a href="#" className="text-muted">Blog</a></li>
//             </ul>
//           </div>

//           <div className="footer-column">
//             <h5>Features</h5>
//             <ul className="list-unstyled mb-0">
//               <li><a href="#" className="text-muted">Prompts</a></li>
//               <li><a href="#" className="text-muted">Questions</a></li>
//               <li><a href="#" className="text-muted">Assessments</a></li>
//               <li><a href="#" className="text-muted">Dataset</a></li>
//             </ul>
//           </div>

//           <div className="footer-column">
//             <h5>Help</h5>
//             <ul className="list-unstyled mb-0">
//               <li><a href="#" className="text-muted">Privacy Policy</a></li>
//               <li><a href="#" className="text-muted">Terms</a></li>
//               <li><a href="#" className="text-muted">Conditions</a></li>
//             </ul>
//           </div>

//           <div className="footer-column">
//             <h5>Product</h5>
//             <ul className="list-unstyled mb-0">
//               <li>
//                 <a href="#" className="text-muted">Generate Question papers with Answers using AI</a>
//               </li>
//               <li>
//                 <input type="text" placeholder="sample@mail.com" className="footer-input" />
//               </li>
//               <li>
//                 <button className="button button-primary">
//                   Subscribe
//                 </button>
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//       <div className="copyright">
//         <p className="text-center text-muted">© 2024 Lysa Solutions</p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="container-fluid  text-light footer pt-5 mt-5 wow fadeIn" data-wow-delay="0.1s" style={{backgroundColor:"var(--dark)"}}>
      <div className="container py-5">
        <div className="row g-5">
          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-3">Quick Link</h4>
            <p><Link to="/about" className="text-light">About Us</Link></p>
            <p><Link to="/contact" className="text-light">Contact Us</Link></p>
            <p><Link to="/privacy" className="text-light">Privacy Policy</Link></p>
            <p><Link to="/terms" className="text-light">Terms & Condition</Link></p>
            <p><Link to="/faq" className="text-light">FAQs & Help</Link></p>
          </div>
          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-3">Contact</h4>
            <p className="mb-2"><i className="fa fa-map-marker-alt me-3"></i>Coimbatore, Tamil Nadu - 641025</p>
            <p className="mb-2"><i className="fa fa-phone-alt me-3"></i>+91 79041 32288</p>
            <p className="mb-2"><i className="fa fa-envelope me-3"></i>info@lysasolutions.com</p>
            <div className="d-flex pt-2">
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-twitter"></i></a>
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-facebook-f"></i></a>
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-youtube"></i></a>
              <a className="btn btn-outline-light btn-social" href=""><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>

          <div className="col-lg-4 col-md-6">
            <h4 className="text-white mb-3">Subscribe to our Newsletter</h4>
            <p>Subscribe now and join our growing community of learners committed to lifelong education!</p>
            <div className="position-relative mx-auto" style={{ maxWidth: '400px' }}>
              <form action="#">
                <input className="form-control border-0 w-100 py-3 ps-4 pe-5" type="email"
                  placeholder="Your email" required />
                <button type="submit"
                  className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2">
                  <a href="mailto:info@lysasolutions.com">Subscribe</a>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="copyright">
          <div className="row">
            <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
              &copy; <Link to="/" className="border-bottom">Lysasolutions</Link>, All Right Reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
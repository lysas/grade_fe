
// import React from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEnvelope, faPhoneAlt } from '@fortawesome/free-solid-svg-icons';
// import './Footer.css'
// import logo from '../assets/logo.png';
// import { FaYoutube, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";

// const Footer = () => {
//   return (
//     <footer className="footer" >
//       <div className="container1" style={{height:'280px', paddingLeft:'160px',paddingTop:'20px'}}>
//         <div className='all'>
//         <div className='every'>
//             <a href="#" className="navbar-brand">
//               <img src={logo} alt="Company Logo" className="img-fluid" />
//             </a>
//             <p className="text-muted">
//               Al-Powered Solutions for the Education industry
//             </p>
//             <div >
//             <FaYoutube className='upload-icon1' data-testid="youtube-icon"/>
//             <FaTwitter className='upload-icon1'data-testid="twitter-icon"/>
//             <FaInstagram className='upload-icon1' data-testid="instagram-icon"/>
//             <FaFacebook className='upload-icon1'data-testid="facebook-icon"/>

//             </div>
            
//           </div>
//           <div className='every'>
//             <h5>Company</h5>
//             <ul className="list-unstyled mb-0 ">
//               <li>
//                 <a href="#" className="text-muted">About Us</a>
//               </li>
//               <li>
//                 <a href="#" className="text-muted">Features</a>
//               </li>
//               <li>
//                 <a href="#" className="text-muted">Products</a>
//               </li>
//               <li>
//                 <a href="#"className="text-muted">Services</a>
//               </li>
//               <li>
//                 <a href="#" className="text-muted">Blog</a>
//               </li>
//             </ul>
//           </div>
//           <div className='every'>
//             <h5 >Features</h5>
//             <ul className="list-unstyled mb-0">
//               <li>
//                 <a href="#"className="text-muted">Prompts</a>
//               </li>
//               <li>
//                 <a href="#"className="text-muted">Questions</a>
//               </li>
//               <li>
//                 <a href="#"className="text-muted">Assessments</a>
//               </li>
//               <li>
//                 <a href="#"className="text-muted">Dataset</a>
//               </li>
//             </ul>
//           </div>
//           <div className='every' >
//             <h5 >Help</h5>
//             <ul className="list-unstyled mb-0">
//               <li>
//                 <a href="#"className="text-muted">Privacy Policy</a>
//               </li>
//               <li>
//                 <a href="#" className="text-muted">Terms</a>
//               </li>
//               <li>
//                 <a href="#"className="text-muted">Conditions</a>
//               </li>
//             </ul>
//           </div>
//           <div className='every'>
//             <h5 >Product</h5>
//             <ul className="list-unstyled mb-0">
//               <li>
//                 <a href="#" className="text-muted">Generate Question papers with Answers using AI</a>
//               </li>
//               <li>
//                 <input type="text" placeholder='sample@mail.com'/>
//               </li>
//               <li>
//                 <button className='button button-primary' style={{padding:'3px'}}>
//                   Subscribe
//                 </button>
//               </li>
    
//             </ul>
//           </div>
//           {/* <div className="col-md-4 mb-4 mb-md-0">
//             <h5 className="text-uppercase font-weight-bold mb-4">Contact Us</h5>
//             <ul className="list-unstyled mb-0">
//               <li>
//                 <a href="#">
//                   <FontAwesomeIcon icon={faEnvelope} /> samplegmail.com
//                 </a>
//               </li>
//               <li>
//                 <a href="#">
//                   <FontAwesomeIcon icon={faPhoneAlt} /> +1234567890
//                 </a>
//               </li>
//             </ul>
//           </div> */}
//         </div>
//       </div>
//       <div className="copyright" >
//         <p className="text-center text-muted">© 2024 Lysa Solutions</p>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from 'react';
import { FaYoutube, FaTwitter, FaFacebook, FaInstagram } from "react-icons/fa";
import './Footer.css';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-content">
          <div className="footer-column brand-column">
            <a href="#" className="navbar-brand">
              <img src={logo} alt="Company Logo" className="img-fluid" />
            </a>
            <p className="text-muted" style={{marginTop:"6px"}}>
              AI-Powered Solutions for the Education industry
            </p>
            <div className="social-icons">
              <FaYoutube className="upload-icon1" data-testid="youtube-icon" />
              <FaTwitter className="upload-icon1" data-testid="twitter-icon" />
              <FaInstagram className="upload-icon1" data-testid="instagram-icon" />
              <FaFacebook className="upload-icon1" data-testid="facebook-icon" />
            </div>
          </div>

          <div className="footer-column">
            <h5>Company</h5>
            <ul className="list-unstyled mb-0">
              <li><a href="#" className="text-muted">About Us</a></li>
              <li><a href="#" className="text-muted">Features</a></li>
              <li><a href="#" className="text-muted">Products</a></li>
              <li><a href="#" className="text-muted">Services</a></li>
              <li><a href="#" className="text-muted">Blog</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>Features</h5>
            <ul className="list-unstyled mb-0">
              <li><a href="#" className="text-muted">Prompts</a></li>
              <li><a href="#" className="text-muted">Questions</a></li>
              <li><a href="#" className="text-muted">Assessments</a></li>
              <li><a href="#" className="text-muted">Dataset</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>Help</h5>
            <ul className="list-unstyled mb-0">
              <li><a href="#" className="text-muted">Privacy Policy</a></li>
              <li><a href="#" className="text-muted">Terms</a></li>
              <li><a href="#" className="text-muted">Conditions</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h5>Product</h5>
            <ul className="list-unstyled mb-0">
              <li>
                <a href="#" className="text-muted">Generate Question papers with Answers using AI</a>
              </li>
              <li>
                <input type="text" placeholder="sample@mail.com" className="footer-input" />
              </li>
              <li>
                <button className="button button-primary">
                  Subscribe
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p className="text-center text-muted">© 2024 Lysa Solutions</p>
      </div>
    </footer>
  );
};

export default Footer;
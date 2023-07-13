import Button from "react-bootstrap/Button";
import { BsGithub } from "react-icons/bs";
import { BsTiktok } from "react-icons/bs";
import { BsYoutube } from "react-icons/bs";
import "./footer.css";

const Footer = () => {
  return (
    <div className="bg-red-500">
    <div className="container">
      <Button variant="primary">
        <BsGithub />
      </Button>
      <Button variant="secondary">
        <BsTiktok />
      </Button>
      <Button variant="success">
        <BsYoutube />
      </Button>
      </div>
    </div>
  );
};

export default Footer;

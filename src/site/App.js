import React from "react";
import PropTypes from "prop-types";
import {Switch, Route, BrowserRouter, Redirect} from "react-router-dom";
import {Nav, Navbar, Container, Card} from "react-bootstrap";
import { Viewer } from "@react-pdf-viewer/core";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.scss";

import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.6.347/build/pdf.worker.js';

/*************/
/* CONSTANTS */
/*************/
const EXPLOSION_ANIMATION_SIZE = 50;
const SITE_NAME = process.env.NODE_ENV == "production" ? "https://adabrew.com" : "http://localhost";
const BACKMAN_PORT = process.env.REACT_APP_BACKMAN_PORT ? process.env.REACT_APP_BACKMAN_PORT : 6969;
const PageHeader = (props) => <h1 className="page-descriptor-header">{props.children}</h1>;
PageHeader.propTypes = {
    children: PropTypes.node
};

/**********************/
/* General || Utility */
/**********************/
function ExplosionOnClick(event) {
    let previousExplosions = document.getElementsByClassName("explosion-animation");
    for(let i = 0; i < previousExplosions.length; i++){
        previousExplosions[i].remove();
    }
    let img = document.createElement("img");
    img.src = require("url:./images/explosion.gif");
    img.style.width = EXPLOSION_ANIMATION_SIZE.toString() + "px";
    img.style.height = EXPLOSION_ANIMATION_SIZE.toString() + "px";
    let x = event.clientX - EXPLOSION_ANIMATION_SIZE/2;
    let y = event.clientY + window.scrollY - EXPLOSION_ANIMATION_SIZE/2;
    img.style.position = "absolute";
    img.style.left = x.toString() + "px";
    img.style.top = y.toString() + "px";
    img.className = "explosion-animation";
    document.body.appendChild(img);
}
window.addEventListener("click", ExplosionOnClick);

// Nav
const TopNavLinks = (props) => {
    return (
    <>
        <Nav.Link className={props.selected == "Home" ? "selected" : ""} href="/">Home</Nav.Link>
        <Nav.Link className={props.selected == "Projects" ? "selected" : ""} href="/projects">Projects</Nav.Link>
        <Nav.Link className={props.selected == "Resume" ? "selected" : ""} href="/resume">Resume</Nav.Link>
        <Nav.Link className={props.selected == "Blog" ? "selected" : ""} href="/blog">Blog</Nav.Link>
    </>);
};
TopNavLinks.propTypes = {
    selected: PropTypes.string 
};

const TopNavBrand = () => <Nav><Navbar.Brand href="/">Adam Brewer</Navbar.Brand></Nav>;

function TopNav(props) {
    return (
        <Navbar className="navbar" bg="dark" variant="dark">
            <img id="mario-animation" src={require("url:./images/mario.gif")} draggable="false"></img>
            <Container id="nav-container-desktop">
                <TopNavBrand/>
                <Nav className="ms-auto">
                    <TopNavLinks selected={props.selected}/>
                </Nav>
            </Container>
            <Container id="nav-container-mobile">
                <TopNavBrand/>
                <Nav>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto">
                            <TopNavLinks selected={props.selected}/>
                        </Nav>
                    </Navbar.Collapse>
                </Nav>
            </Container>
        </Navbar>
    );
}
TopNav.propTypes = {
    selected: PropTypes.string
};

/*************/
/* Blog Page */
/*************/
function BlogPost(props){
    return (
        <Container className="blog-post">
            <div className="header">
                <h2>{("Post #" + props.number + ": ") ? props.number !== undefined : ""}{props.title}</h2>
            </div>
            <hr/>
            <h3 className="date">{props.date}</h3>
            <div className="text-body">
                {props.children}
            </div>
        </Container>
    );
}
BlogPost.propTypes = {
    title: PropTypes.string,
    date: PropTypes.string,
    children: PropTypes.node,
    number: PropTypes.number
};

function BlogParagraph(props){
    return (
        <p>{props.children}</p>
    );
}
BlogParagraph.propTypes = {
    children: PropTypes.node
};

class Blog extends React.Component {
    constructor(props){
        super(props);
        this.state = {posts: []};
        fetch(`${SITE_NAME}:${BACKMAN_PORT}/api/get-blog-posts`, {mode: "cors"}).then(res => {
            res.json().then(
                data => this.setState({
                    posts: data.posts
                })
            );
        });
    }
    render() {
        // Format posts
        let posts = [];
        let postCount = (this.props.maxPosts && 0 < this.props.maxPosts && this.props.maxPosts < this.state.posts.length)
            ? this.props.maxPosts : this.state.posts.length;
        for(let i = 0; i < postCount; i++){
            let post = this.state.posts[i];
            let bodyTextSplit = post.text.split("\n");
            let bodyTextNodes = [];
            for(let j = 0; j < bodyTextSplit.length; j++){
                bodyTextNodes.push(<BlogParagraph key={j}>{bodyTextSplit[j]}</BlogParagraph>);
            }
            posts.push(<BlogPost number={i+1} title={post.title} date={post.date} key={i}>{bodyTextNodes}</BlogPost>);
        }
        let navbar = this.props.hideNavbar ? null : <TopNav selected="Blog"/>;
        return (
            <>
                {navbar}
                <PageHeader>{postCount != this.state.posts.length ? `${postCount != 1 ? `${postCount} Most Recent Blog Posts` : "Most Recent Blog Post"}` : "Blog Posts"}</PageHeader>
                {posts}
            </>
        );
    }
}
Blog.propTypes = {
    maxPosts: PropTypes.number,
    hideNavbar: PropTypes.bool
};

/****************/
/* Project Page */
/****************/
function ProjectCard(props) {
    return (
        <Card className={props.highlight !== undefined ? "highlight" : "default"}>
            <div className="thumbnail-container">
                <Card.Img variant="top" src={props.image ? props.image : require("url:./images/christmas-cat.gif")} />
            </div>
            <Card.Body>
                <Card.Title>{props.title}<a href={props.href} className="fa fa-external-link fa-sm card-external-link"></a></Card.Title>
                <Card.Text>{props.children}</Card.Text>
            </Card.Body>
        </Card>
    );
}
ProjectCard.propTypes = {
    highlight: PropTypes.string,
    image: PropTypes.any,
    href: PropTypes.string,
    title: PropTypes.string,
    children: PropTypes.node
};

function Projects() {
    return (
        <>
            <TopNav selected="Projects"/>
            <PageHeader>Projects</PageHeader>
            <Container id="project-card-grid-container">
                <div id="project-card-grid">
                    {/* All ProjectCard images should have a square aspect ratio for best quality (they are all resized to square AR)*/}
                    <ProjectCard title="NuInfoSys" href="https://github.com/adamhb123/nuinfosys" image={require("url:./images/projects/nuinfosys.jpg")} highlight>
                        A Python library implementing the Alpha® sign communications protocol to send messages and graphics to Alpha® signs.
                    </ProjectCard>
                    <ProjectCard title="NuInfoSyte" href="https://github.com/adamhb123/nuinfosyte" image={require("url:./images/projects/nuinfosyte.png")} highlight>
                        A web front-end for NuInfoSys that enables users to interact with an Alpha® sign through an intuitive graphical interface.
                    </ProjectCard>
                    <ProjectCard title="OpenGuessr" href="https://github.com/adamhb123/openguessr" image={require("url:./images/projects/openguessr.png")} highlight>
						Similar to GeoGuessr, OpenGuessr is a guessing game where you are dropped at a random location in a map of your choosing
						and have to guess where you are located.
                    </ProjectCard>
                    <ProjectCard title="Portfolio Site" href="#" image={require("url:./images/projects/portfolio.png")}>
						You&apos;re on it. Utilized ReactJS, Parcel, NodeJS, HTML/CSS/JS, etc... to make it.
                    </ProjectCard>
                    <ProjectCard title="FoodVibes" href="https://github.com/adamhb123/food-vibes-plus" image={require("url:./images/projects/foodvibes.png")}>
						Food vibes takes an audio file and gives you food recommendations based on your &apos;vibes&apos;/song.
                    </ProjectCard>
                    <ProjectCard title="Smal.me" href="https://github.com/adamhb123/Smal.me" image={require("url:./images/projects/smalme.png")}>
						A simple link shortener, my first foray into PHP.
                    </ProjectCard>
                </div>
            </Container>
        </>
    );
}

/*************/
/* Home Page */
/*************/
function Home() {
    return (
        <>
            <TopNav selected="Home"/>
            <PageHeader>Home</PageHeader>
            <Container id="home-post" className="blog-post">
            <div className="header">
                <h2 id="home-post-header">Hello!</h2>
            </div>
            <hr/>
            <div id="home-text-container" className="text-body">
                <div>
                    <img id="home-photo" src={require("url:./images/homephoto.jpg")}/>
                </div>
                <p>
                    I&apos;m Adam Brewer, a Computer Science student and Software Engineer, currently attending the Rochester Institute
                    of Technology. Programming has been my foremost passion since the age of eleven, and it has always been my dream to
                    work on products that will benefit others.
                            
                    This website was made from scratch in ReactJS, and Parcel as a build tool. Blog posts are hosted on an ExpressJS-powered
                    backend server, accessible through GET calls to the minimal API. More details are available...on my <a id="home-link" href="/blog">blog page</a>!
                </p>
            </div>
        </Container>
        </>
    );
}

/***************/
/* Resume Page */
/***************/
function Resume(){
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const resume = require("url:./images/resume.pdf");
    return(
        <>
            <TopNav selected="Resume"/>
            <PageHeader>Resume</PageHeader>
            <div id="resume-container">
                <Viewer fileUrl={resume} plugins={[defaultLayoutPluginInstance]} />
            </div>
        </>
    );
}

/******************************/
/* Export for use in index.js */
/******************************/
// eslint-disable-next-line react/display-name
export default () => (
    <BrowserRouter>
        <Switch>
            <Route path="/projects" component={Projects}/>
            <Route path="/blog" component={Blog}/>
            <Route path="/resume" component={Resume}/>
            <Route exact path="/" component={Home}/>
            <Route path="/*">
                <Redirect to="/"/>
            </Route>
        </Switch>
    </BrowserRouter>
);

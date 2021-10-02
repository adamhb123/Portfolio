import React from "react";
import {useState} from "react";
import {Switch, Route, BrowserRouter, Redirect} from "react-router-dom";
import {Nav, Navbar, Container, Card, Button, CarouselItem} from "react-bootstrap";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
function NavLinkButton(props){
	return <Nav.Link href={props.href} className="nav-link">{props.children}</Nav.Link>
}

function TopNav() {
	return (
		<Navbar className="navbar" bg="dark" expand="lg" variant="dark">
			<Container>
				<Nav className="ms-auto">
					<NavLinkButton href="/">Home</NavLinkButton>
					<NavLinkButton href="/projects">Projects</NavLinkButton>
				</Nav>
			</Container>
		</Navbar> 
	);
}

function ProjectCardCarousel(props){
	return (
		<Carousel
			additionalTransfrom={0}
			arrows
			autoPlay={true}
			autoPlaySpeed={3000}
			centerMode={true}
			className="project-card-carousel"
			containerClass="container"
			dotListClass=""
			draggable
			focusOnSelect={false}
			infinite={true}
			itemClass="project-card-container"
			keyBoardControl
			minimumTouchDrag={80}
			partialVisible={false}
			pauseOnHover={true}
			renderButtonGroupOutside={false}
			renderDotsOutside={false}
			responsive={{
				desktop: {
				breakpoint: {
					max: 3000,
					min: 1024
				},
				items: 3,
				partialVisibilityGutter: 40
				},
				mobile: {
				breakpoint: {
					max: 464,
					min: 0
				},
				items: 1,
				partialVisibilityGutter: 30
				},
				tablet: {
				breakpoint: {
					max: 1024,
					min: 464
				},
				items: 2,
				partialVisibilityGutter: 30
				}
			}}
			showDots={false}
			sliderClass=""
			slidesToSlide={1}
			swipeable>
			{props.children}
		</Carousel>
	);
}

function ProjectCard(props){
	return (
		<Card className="card">
			<Card.Img variant="top" src={props.image ? props.image : require('url:./images/christmas-cat.gif')} />
			<Card.Body>
				<Card.Title>{props.title}</Card.Title>
				<Card.Text>{props.children}</Card.Text>
				<Button className="card-button">Read More</Button>
			</Card.Body>
		</Card>
	);
}

function Home(){
	return (
		<>
			<TopNav/>
		</>
	);
}

function Projects() {
	return (
		<>
			<TopNav/>
			<h1 id="my-projects-header" className="text-center">
				My Projects
			</h1>
			<div id="project-card-container">
				<ProjectCardCarousel>
					<ProjectCard title="NuInfoSys">A blahblah</ProjectCard>
					<ProjectCard title="NuInfoSyte">A blahblah blah to blah blah blah blah</ProjectCard>
					<ProjectCard title="OpenGuessr">AFEFAGEGEfeg guhg guh ughughu ghg uh guhg ah</ProjectCard>
					<ProjectCard title="Spaghetti">AFEFAGEGEfeg guhg guh ughughu ghg uh guhg ah</ProjectCard>
					<ProjectCard title="Hamburger">AFEFAGEGEfeg guhg guh ughughu ghg uh guhg ah</ProjectCard>
					<ProjectCard title="Fries">AFEFAGEGEfeg guhg guh ughughu ghg uh guhg ah</ProjectCard>
				</ProjectCardCarousel>
			</div>
		</>
	);
}

export default () => (
	<BrowserRouter>
		<Switch>
			<Route path="/projects" component={Projects}/>
			<Route exact path="/" component={Home}/>
			<Route path="/*">
				<Redirect to="/"/>
			</Route>
		</Switch>
	</BrowserRouter>
);

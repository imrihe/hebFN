HebFN
===============

Hello and welcome to the Hebrew FrameNet project.

The project's development is being lunched these days - we are expecting it to be available by 2014


architecture:

    database - mongoDB

    server- node.js with express

    views - jade with angular
    
    
    
The project is being developed in the department of computer science in Ben-gurion University of the Negev Israel, under the NLP group
http://www.cs.bgu.ac.il/~nlpproj/




Client Side
=========
This readme assumes you are familier with AngularJS,NodeJS Jade template engine, JQuery.
The client side uses AngularJS v1.0.7 for dynamic content handling and page routing.
Pages in the annotate module(/annotate#*) are loaded by AJAX.
Once a pages is defined in annotate.js $routeProvider it is assigned with a direction for its partial HTML eg "annotate/partials/add-lus" and its AngularJS controller.
Server side scripts render requests to(URI) annotate/partials/FOO using the NodeJS Express Jade template engine by compiling the template (server-side):views/ann_partials/FOO.jade
The AngularJS controller can usually be found under (server) public/javascript/ang_controllers/FOO.js and should hold most of FOO page logic
The ang_globals.js contains some global utility functions

AJAX calls are sometimes handled by JQuery calls (AngularJS includes JQuery in its distribution)

Styling of the client side is done mosty by Twitter Bootstrap 2.3. we also used bootstrap's modal in several places 

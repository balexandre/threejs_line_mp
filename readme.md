### Work with ThreeJs and lineMP

a simple project with ThreeJs and the Medium Point algorithm


### How does it work

navigate with the mouse to a point in the plan, click the `X` key once to mark the start of the line, navigate to the next point, click the `X` key to draw a line from the starting point and draw the path using the lineMP

press `Backspace` key to clear all lines on the plan

![image](https://user-images.githubusercontent.com/45473/143938728-1a177db8-1e4c-423e-a57a-9456406dea4c.png)



### Unit tests

lineMP has unit tests so one can change it and make sure it does not change the result

run `npm test` in order to execute them

### How to run

as we use threeJs from a CDN, you need to run the folder as a webserver, or you will get CORS error.
for that, run in the root folder `npx http-server` and navigate to http://localhost:8080 to see the web page

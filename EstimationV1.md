# Project Estimation - CURRENT
Date: 21/04/2023

Version: 0.1


# Estimation approach
Consider the EZWallet  project in CURRENT version (as received by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course
# Estimate by size
### 
|             | Estimate                        |             
| ----------- | :-------------------------------: |  
| NC =  Estimated number of classes to be developed   |    21                   |             
|  A = Estimated average size per class, in LOC       |        38                    | 
| S = Estimated size of project, in LOC (= NC * A) |807 |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)  |       807 / 10 = 80 person hours                               |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro) | 30 * 80 = 2400€ | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) |    80/(8 * 5 * 4)  = 0.5 weeks              |               


# Estimate by product decomposition
### 
|         component name    | Estimated effort (person hours)   |             
| ----------- | :-------------------------------: | 
|requirement document    |  30 |
| GUI prototype |   10|
|design document | 50|
|code | 50|
| unit tests | 35|
| api tests | 35|
| management documents  | 10|


# Estimate by activity decomposition
### 
|         Activity name    | Estimated effort (person hours)   |             
| ----------- | :-------------------------------: | 
| <ul> <li> Requirement Gathering: <ul> <li> Identify user requirements</li><li> Identify structural requirements</li><li>Perform workflow analysis</li><li>Perform Estimation documentation</li><li>Plan the software specifications</li><li>Software specifications review</li></ul></ul>| 40 |
|<ul> <li>Design</li><ul><li>Perform system design</li><li>Perform functional design</li><li>Select the working environment</li><li>Design the Website Wireframe sketch (GUI)</li></ul> </ul>| 60 |
| <ul><li>Developing</li><ul><li>Docker + npm configuration</li><li>Backend:</li><ul><li>Database connection</li> <li>Api generation</li><li>Security system</li></ul></ul> |50|
| <ul><li>Testing and production</li><ul><li>User acceptance testing</li><li>Usability testing</li><li>Deployment</li></ul> |70 |
###


<div style="text-align:center"><img src="./media/V1/grantt.png"  width="800" height="400"/></div>

# Summary

Report here the results of the three estimation approaches. The  estimates may differ. Discuss here the possible reasons for the difference

|             | Estimated effort                        |   Estimated duration |          
| ----------- | :-------------------------------: | :---------------:|
| estimate by size |80ph|<1 weeks
| estimate by product decomposition | 100ph|<1 weeks
| estimate by activity decomposition |220ph|1.4 weeks



The estimation by size is determined by counting the number of modules in the web application as classes. This includes the files containing the application's functionality, which outline its structure. The lines of code (LOC) counted exclude comments and blank spaces in those aforementioned files. Ultimately, the estimation is based on the current functionality offered by the web application thus is reasonable to consider this number.


The estimation based on product decomposition is based on the evalutation of the ideas as well as the complexity of the application and the technlogy used. Notice, it is little higher with respect to the previous estimation because former additional factors are considered.

The estimated time based on activity decomposition is subject to multiple factors, including the team members' experience, their workload on other projects that might impede the overall timeline, team-building commitments, mislead project planning and brainstorming meetings. Consequently, the estimated activities may take more time than any previously discussed estimations.

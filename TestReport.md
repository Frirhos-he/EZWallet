# Test Report

<The goal of this document is to explain how the application was tested, detailing how the test cases were defined and what they cover>

# Contents

- [Dependency graph](#dependency-graph)

- [Integration approach](#integration-approach)

- [Tests](#tests)

- [Coverage](#Coverage)





# Dependency graph 

     <report the here the dependency graph of EzWallet>
<div style="text-align:center"><img src="./images/dependency graph.png"  width="750" height="750"/>
     
# Integration approach

    <Write here the integration sequence you adopted, in general terms (top down, bottom up, mixed) and as sequence
    (ex: step1: unit A, step 2: unit A+B, step 3: unit A+B+C, etc)> 
    <Some steps may  correspond to unit testing (ex step1 in ex above)>
    <One step will  correspond to API testing, or testing unit route.js>


The integration sequence that was adopted follows a bottom-up approach starting from unit testing ending with API testing. 
The development process started by creating the individual functions. These functions were then isolately tested using unit tests. Mocks objects were used to simulate dependencies ensuring that each mocked functions behaved correctly.
 We then integrated functions and modules ensuring that the interaction between the functions and their dependencies worked as expected. 
API testing was conducted handling routes incoming requests and cofnirming the expected response.
# Tests

   <in the table below list the test cases defined For each test report the object tested, the test level (API, integration, unit) and the technique used to define the test case  (BB/ eq partitioning, BB/ boundary, WB/ statement coverage, etc)>   <split the table if needed>


| Test case name | Object(s) tested | Test level | Technique used |
|--|--|--|--|
|||||





# Coverage



## Coverage of FR

<Report in the following table the coverage of  functional requirements (from official requirements) >

| Functional Requirements covered |   Test(s) | 
| ------------------------------- | ----------- | 
|  FR1    | Manage users |
| FR11 | register |
| FR12| login |
| FR13| logout | 
| FR14 | registerAdmin |
| FR15 | getUsers | 
| FR16 | getUser | 
| FR17 | deleteUser | 
| FR2 | Manage groups |
| FR21 | createGroup |
| FR22| getGroups |
| FR23| getGroup |
| FR24| addToGroup | 
| FR26| removeFromGroup |
| FR28| deleteGroup |
|  FR3   |  Manage  transactions| 
|FR31| createTransaction| 
|FR32| getAllTransactions | 
| FR33| getTransactionsByUser  |
| FR34| getTransactionsByUserByCategory|
| FR35| getTransactionsByGroup | 
| FR36| getTransactionsByGroupByCategory |
| FR37| deleteTransaction | 
| FR38| deleteTransactions |
|  FR4  |  Manage categories |
| FR41| createCategory | 
| FR42| updateCategory | 
| FR43| deleteCategory |
| FR44 | getCategories | 




## Coverage white box

Report here the screenshot of coverage values obtained with jest-- coverage 







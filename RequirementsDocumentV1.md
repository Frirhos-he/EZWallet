# Requirements Document - current EZWallet

Date: 

Version: V1 - description of EZWallet in CURRENT form (as received by teachers)

 
| Version number | Change |
| ----------------- |:-----------|
| | | 


# Contents

- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
	+ [Context Diagram](#context-diagram)
	+ [Interfaces](#interfaces) 
	
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
	+ [Functional Requirements](#functional-requirements)
	+ [Non functional requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
	+ [Use case diagram](#use-case-diagram)
	+ [Use cases](#use-cases)
    	+ [Relevant scenarios](#relevant-scenarios)
- [Glossary](#glossary)
- [System design](#system-design)
- [Deployment diagram](#deployment-diagram)

# Informal description
EZWallet (read EaSy Wallet) is a software application designed to help individuals and families keep track of their expenses. Users can enter and categorize their expenses, allowing them to quickly see where their money is going. EZWallet is a powerful tool for those looking to take control of their finances and make informed decisions about their spending.



# Stakeholders

| Stakeholder name  | Description | 
| ----------------- |:-----------:|
|   User     | The entity that uses the system         | 

# Context Diagram and interfaces

## Context Diagram
`TODO: insert context diagram`

### Actor

- User

## Interfaces
| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| :-----:|
|  User    | GUI (insert/delete/view transactions, create categories)  | Smartphone |

# Stories and personas
`TODO: insert stories and personas`

# Functional and non functional requirements

## Functional Requirements

| ID        | Description  |
| ------------- |:-------------:|
|  FR1     | Create account |
| FR2  | Create categories |
| FR3  | Manage transactions |
| FR3.1  | Create transaction |
| FR3.2  | Delete transaction |
| FR3.3  | View transactions |   


## Non Functional Requirements
`TODO: insert non functional requirements v1`

| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     |  | | |
| NFRx .. | | | | 


# Use case diagram and use cases
`TODO: insert use case diagram`

## Use case diagram

### Use case Login
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | The user is authorized to log in |
|  Nominal Scenario     | The user want to log in (without any token). He/She insert the credentials, the credentials are correct |
|  Variants     | The user has already an access token and or a refresh token not yet expired. |
|  Exceptions     | 1) The user insert a wrong password. 2) The account doesn't exist. |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | The user is authorized to use the app |
| Step#        | Description  |
|  1     | The system asks for the credentials |  
|  2     | The user insert the credentials |
|  3	 | The system validate the credentials |
|  4	 | The system send an access token and a refresh token |
|  5	 | The user's browser store the token for furthere use |
|  6	 | The user is authorized|

##### Scenario 2 (User with token)
| Scenario 2.1 | User with token |
| ------------- |:-------------:| 
|  Precondition     | The user has an access token and/or a refresh token |
|  Post condition     | The user is authorized to use the app |
| Step#        | Description  |
|  1     | The system asks for the access token |  
|  2     | The user's browser give the access token to the server or OR it requires a new access token with an api call by giving the refresh token to the server |
|  3	 | The user is authorized |

##### Scenario 3 (Exception)
| Scenario 3.1 | Password is wrong |
| ------------- |:-------------:| 
|  Precondition     | The password is wrong  |
|  Post condition     | The user is not authorized to use the app |
| Step#        | Description  |
|  1     | The system asks for the credentials |  
|  2     | The user insert a wrong password |
|  3	 | The system send back an error to the user |

| Scenario 3.2 | Email doen't exist |
| ------------- |:-------------:| 
|  Precondition     | The account doesn't exist |
|  Post condition     | The user is not authorized to use the app |
| Step#        | Description  |
|  1     | The system asks for the credentials |  
|  2     | The user insert a wrong email |
|  3	 | The system send back an error to the user |

### Use case Sign up
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user hasn't an account |
|  Post condition     | The user has an account |
|  Nominal Scenario     | The user want to create an account. The email is vaild. The user successfully create an account|
|  Variants     | - |
|  Exceptions     | 1) The email is already used by another user |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user hasn't an account |
|  Post condition     | The user has an account |
| Step#        | Description  |
|  1     | The system asks to insert an email, an username and a password for the new account |  
|  2     | The user isnert the data requested by the system |
|  3	 | The system check that the email is not used by any user yet |
|  4	 | The user has now an account |

##### Scenario 2 (Exceptions)
| Scenario 2.1 | Email already in use |
| ------------- |:-------------:| 
|  Precondition     | The email is already used by another user |
|  Post condition     | The account is not created for the user |
| Step#        | Description  |
|  1     | The system asks to insert an email, an username and a password for the new account | 
|  2     | The system check that the email is not used by any user yet |
|  3	 | The system detects that the email is already in use |
|  4	 | The system returns an error to the user |
|  5	 | The account creation fails |


### Use case Create Transaction
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | The transaction is created inside the user's account |
|  Nominal Scenario     | The user want to create a transaction, the transaction is successfully created|
|  Variants     | - |
|  Exceptions     | - |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | The transaction is created inside the user's account |
| Step#        | Description  |
|  1     | The user asks to create a transaction (giving: name, amount, type) |  
|  2     | The system insert the new transaction inside the database |
|  3	 | The transaction is created and the user can now see it inside the app |

### Use case Delete Transaction
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user has a transaction inside his account |
|  Post condition     | The transaction is deleted |
|  Nominal Scenario     | The user want to delete a transaction, the transaction is deleted |
|  Variants     | - |
|  Exceptions     | - |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user has a transaction inside his account |
|  Post condition     | The transaction is deleted |
| Step#        | Description  |
|  1     | The user asks to delete a transaction |  
|  2     | The system delete the transaction from the database |
|  3	 | The transaction is deleted and the user cannot see it anymore in the app |

### Use case Get Transaction
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the transactions are shown to the user |
|  Nominal Scenario     | The user want to view all his transactions, all the transactions are shown |
|  Variants     | - |
|  Exceptions     | - |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the transactions are shown to the user |
| Step#        | Description  |
|  1     | The user asks to view all his transactions |  
|  2     | The system retreive all the transactions of the user from the database |
|  3	 | The list of transactions is sent to the user |

### Use case Create Category
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | The new category is created |
|  Nominal Scenario     | The user want to create a category, the category is created|
|  Variants     | - |
|  Exceptions     | - |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | The new category is created |
|  Nominal Scenario     | The user want to create a category, the category is created|
| Step#        | Description  |
|  1     | The user asks to create a category (giving: type, color) |  
|  2     | The system create a new cateogry |
|  3	 | The category is now available to the user |

### Use case Get Category
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the categories are shown to the user |
|  Nominal Scenario     | The user want to view all his categories, all the categories are shown |
|  Variants     | - |
|  Exceptions     | - |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the categories are shown to the user |
| Step#        | Description  |
|  1     | The user asks to view all his categories |  
|  2     | The system retreive all the categories of the user from the database |
|  3	 | The list of categories is sent to the user |

### Use case Get Labels
| Actors Involved        | User |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the transactions with their respective category (type and color) are shown to the user |
|  Nominal Scenario     | The user want to view all his transaction in more detail, all the transactions are shown with their respective category type and color |
|  Variants     | - |
|  Exceptions     | - |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the transactions with their respective category (type and color) are shown to the user |
| Step#        | Description  |
|  1     | The user asks to view all his transactions along with the details regarding their category type and color |  
|  2     | The system retreive all the transactions and the categories from the database |
|  3	 | The list of transactions joined with the respective categories description are sent to the user |

### Use case Get Users
| Actors Involved        | Admin |
| ------------- |:-------------:| 
|  Precondition     | The admin has rights to access the users  |
|  Post condition     | All the users are shown to the admin |
|  Nominal Scenario     | The admin want to view all users inside the database, all the users are shown |
|  Variants     | The admin want to search for a specific user |
|  Exceptions     | 1) When filtering by username the username and the refresh token don't match |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | Nominal Scenario |
| ------------- |:-------------:| 
|  Precondition     | The admin has rights to access the users  |
|  Post condition     | All the users are shown to the admin |
| Step#        | Description  |
|  1     | The admin querys the database to retrieve all the users |  
|  2     | The system retreive all users inside the database |
|  3	 | The list of users is sent to the admin |

##### Scenario 2 (Filter by username)
| Scenario 2.1 | Filter by username - success |
| ------------- |:-------------:| 
|  Precondition     | The admin has rights to access the users  |
|  Post condition     | The specific user is shown to the admin |
| Step#        | Description  |
|  1     | The admin querys the database to retrieve the user |  
|  2     | The system retreive the user inside the database |
|  3	 | The user's data is sent to the admin |

| Scenario 2.2 | Filter by username - exception |
| ------------- |:-------------:| 
|  Precondition     | The admin has rights to access the users  |
|  Post condition     | The specific user is not shown to the admin |
| Step#        | Description  |
|  1     | The admin querys the database to retrieve the user |  
|  2     | The given username and refresh token don't match |
|  3	 | The system send to the admin an error |

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships> 

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >





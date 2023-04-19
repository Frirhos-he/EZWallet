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
| Administrator       | Priviledged entity            |
|   Google Play / Apple Store     | Platform to distribuite the system            |
|   Google Ads     |  System to visualize advertisement           |
|  Developer      | Programmers involved in the production of the system            |
|  Analyst      | Domain expert             |

# Context Diagram and interfaces

## Context Diagram

![Context Diagram](/V1/ContextDiagram.png)

### Actor

- User
- Administrator
- Google Ads
- Analyst


## Interfaces


| Actor | Logical Interface | Physical Interface  |
| ------------- |:-------------:| :-----:|
|  User    | GUI (To define - insert expenses, list categorized expenses)  | Smartphone |
|  Administrator    | GUI(To define - all functions, manage accounts)  | PC  |
|  Google Ads    | Api:https://developers.google.com/google-ads/api/docs/start| Internet |
|  Analyst    | GUI(To define - all functions, data analysis) | PC |


# Stories and personas

Laura thinks she is not properly controlling her finance thus she needs to use EZWallet to get an overview and understand the reasons behind so many expenses.

Marco just started a new job and is planning a trip for his future holidays thus want to manage his savings and understand whether invest or not. 
# Functional and non functional requirements

## Functional Requirements

| ID        | Description  |
| ------------- |:-------------:| 
|  FR1     | Manage account |
|  FR2     | Show list of categorized transactions  |
| FR3  | Manage categories |
| FR4  | Manage advertisements |  
| FR5  | Manage analysis |  


## Non Functional Requirements


| ID        | Type (efficiency, reliability, ..)           | Description  | Refers to |
| ------------- |:-------------:| :-----:| -----:|
|  NFR1     | Usability  | User with <6m mobile experience is capable of using the functions of the application | |
|  NFR2     |Portability | iOS v10, Android v9.0  | |
|  NFR3     | Security | - | |
| NFRx .. | | | | 


# Use case diagram and use cases


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
| Scenario 1.1 | |
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
| Scenario 2.1 | |
| ------------- |:-------------:| 
|  Precondition     | The user has an access token and/or a refresh token |
|  Post condition     | The user is authorized to use the app |
| Step#        | Description  |
|  1     | The system asks for the access token |  
|  2     | The user's browser give the access token to the server or OR it requires a new access token with an api call by giving the refresh token to the server |
|  3	 | The user is authorized |

##### Scenario 3 (Exception)
| Scenario 3.1 | |
| ------------- |:-------------:| 
|  Precondition     | The password is wrong  |
|  Post condition     | The user is not authorized to use the app |
| Step#        | Description  |
|  1     | The system asks for the credentials |  
|  2     | The user insert a wrong password |
|  3	 | The system send back an error to the user |

| Scenario 3.2 | |
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
| Scenario 1.1 | |
| ------------- |:-------------:| 
|  Precondition     | The user hasn't an account |
|  Post condition     | The user has an account |
| Step#        | Description  |
|  1     | The system asks to insert an email, an username and a password for the new account |  
|  2     | The user isnert the data requested by the system |
|  3	 | The system check that the email is not used by any user yet |
|  4	 | The user has now an account |

##### Scenario 2 (Exceptions)
| Scenario 2.1 | |
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
| Scenario 1.1 | |
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
| Scenario 1.1 | |
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
| Scenario 1.1 | |
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
| Scenario 1.1 | |
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
| Scenario 1.1 | |
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

### Use case Get Users
| Actors Involved        | Admin |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the transactions are shown to the user |
|  Nominal Scenario     | The user want to view all his transactions, all the transactions are shown |
|  Variants     | - |
|  Exceptions     | - |

##### Scenario 1 (Nominal Scenario)
| Scenario 1.1 | |
| ------------- |:-------------:| 
|  Precondition     | The user has an account |
|  Post condition     | All the transactions with their respective category (type and color) are shown to the user |
| Step#        | Description  |
|  1     | The user asks to view all his transactions along with the details regarding their category type and color |  
|  2     | The system retreive all the transactions and the categories from the database |
|  3	 | The list of transactions joined with the respective categories description are sent to the user |

# Glossary

\<use UML class diagram to define important terms, or concepts in the domain of the application, and their relationships> 

\<concepts must be used consistently all over the document, ex in use cases, requirements etc>

# System Design
\<describe here system design>

\<must be consistent with Context diagram>

# Deployment Diagram 

\<describe here deployment diagram >





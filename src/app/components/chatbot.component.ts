import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { UserRegisteredComponent } from './user-registered.component';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit {
  userId!: number;
  userInput: string = "";
  chatMessages: { sender: string, message: string, isOptions?: boolean, options?: string[] }[] = [];
  isChatboxOpen: boolean = false; // State to control chat visibility
  userName: string = ''; // Store user's name

  constructor(private router: Router, private dataService: DataService) {}

  ngOnInit(): void {
    this.getUserInfo();
    this.userId = parseInt(localStorage.getItem('userId') || '0', 10);
    this.loadChatHistory(); // Load chat history on startup
  }

  toggleChatbox() {
    this.isChatboxOpen = !this.isChatboxOpen;
    if (this.isChatboxOpen) {
      this.loadChatHistory(); // Reload chat history when opened
    }
  }

  getUserInfo(): void {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const userId = parseInt(storedUserId, 10);
      this.dataService.getUserInfo(userId).subscribe(
        (response) => {
          this.userName = response.name;
        },
        (error) => {
          console.error('Error fetching user info:', error);
        }
      );
    } else {
      console.error('User ID not found in localStorage');
    }
  }

  handleUserMessage() {
    if (this.userInput.trim()) {
      this.chatMessages.push({ sender: this.userName + ' (ME)', message: this.userInput });
  
      const botResponse = this.getBotResponse(this.userInput.toLowerCase());
      this.chatMessages.push(botResponse);
  
      this.userInput = ''; // Clear input
      this.saveChatHistory(); // Save chat messages
    }
  }

  getBotResponse(userMessage: string) {
    const responses: { [key: string]: string } = {
      "help": "Sure! What do you need help with?",
      "contact": "You can reach us at deviieydevendranath@gmail.com",
      "bye": "Goodbye! Have a great day!"
    };

    if (userMessage === "hi" || userMessage === "hello" || userMessage === "hey") {
      return {
        sender: 'Bubbles',
        message: "Hello! I am Bubbles, please choose a question below for further assistance:",
        isOptions: true,
        options: ["What services do you offer?", "How can I contact support?", "What are your working hours?"]
      };
    }

    return {
      sender: 'Bubbles',
      message: responses[userMessage] || "I'm not sure about that. Can you rephrase?"
    };
  }

  selectOption(option: string) {
    this.chatMessages.push({ sender: this.userName + ' (ME)', message: option });
  
    const predefinedResponses: { [key: string]: string } = {
      "What services do you offer?": "We provide web development, mobile apps, and cloud solutions.",
      "How can I contact support?": "You can reach our support team at deviieydevendranath@gmail.com",
      "What are your working hours?": "Our working hours are Monday to Friday, 9 AM - 6 PM."
    };
  
    const responseMessage = predefinedResponses[option] || "I'm not sure about that. Can you rephrase?";
    this.chatMessages.push({ sender: 'Bubbles', message: responseMessage });
  
    this.saveChatHistory(); // Save chat messages
  }

  saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(this.chatMessages));
  }

  loadChatHistory() {
    const savedChats = localStorage.getItem('chatHistory');
    if (savedChats) {
      this.chatMessages = JSON.parse(savedChats);
    }
  }
  // loadChatHistory() {
  //   const storedHistory = localStorage.getItem('chatHistory');
  //   if (storedHistory) {
  //     this.chatMessages = JSON.parse(storedHistory);
  //   }
  // }

  clearChatHistory() {
    localStorage.removeItem('chatHistory');
  }
}

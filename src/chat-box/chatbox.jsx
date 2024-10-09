import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import "./style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import { FaUser } from "react-icons/fa";
import chatbutton from "./images/chat.svg";
import chatlogo from "./images/chat-logo.svg";
import sendchat from "./images/send-chat.svg";
import { BeatLoader } from "react-spinners";
import ReactPlayer from "react-player";
// YouTubeEmbed component memoized
const YouTubeEmbed = memo(
  ({ url }) => (
    <div>
      <div style={{ marginTop: "20px" }}>
        <ReactPlayer url={url} controls={true} width="230px" height="170px" />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="youtube-link"
      >
        {url}
      </a>
    </div>
  ),
  (prevProps, nextProps) => prevProps.url === nextProps.url
);

// ChatMessage components memoized
const BASE_URL = 'http://103.127.143.141:3000/';
const ChatBotMessage = ({ messageObj }) => {
  const lines = convertMessage(messageObj.message);
  return <div>{lines}</div>;
};
const convertMessage = (message) => {
  return message.split('<br>').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < message.split('<br>').length - 1 && <br />}
    </React.Fragment>
  ));
};


const ChatMessage = memo(
  ({ msg, isLoading, isLatestMessage }) => (
    <div className="chat-box-body" key={msg.id}>
      {msg.messageType !== "out" && msg.messageType !== "greet" && (
        <div className="chat-box-right-send">
          <div className="chat-box-body-send">
            <p>{msg.message}</p>
          </div>
          <div className="chat-box-time">Today {msg.time}</div>
        </div>
      )}

      {msg.messageType === "greet" && (
        <div className="chat-box-left"  >
          <div className="chat-box-body-greet">
            {isLatestMessage && (
              <img
                src={chatlogo}
                className="chat-icon-from-top"
                alt="Chat Icon"
              />
            )}

<p>{msg.message}</p>

          </div>
          <div className="chat-box-time">Today {msg.time}</div>
        </div>
      )}

      {msg.messageType === "out" && (
        <div className="chat-box-left">
          <div className="chat-box-body-receive">
            {isLatestMessage && (
              <img
                src={chatlogo}
                className="chat-icon-from-top-new {
"
                alt="Chat Icon"
              />
            )}

            <p className="chat-txt-hed">HMIS</p>
          <p  className="chat-txt-cont"><ChatBotMessage messageObj={msg} /></p>  
            <div className="youtube-url">
              {msg.source === "youtube_video" && (
                <YouTubeEmbed url={msg.link} />
              )}
            </div>
          </div>
        </div>
      )}
      {msg.messageType === "out" && msg.source === "youtube_video" && (
        <div className="chat-box-left">
          <div className="chat-box-fotr-bottom">
            <div className="chat-txt-hed">
              Source: <span className="clr-black">Youtube Video</span>
            </div>
          </div>
          <div className="chat-box-time">Today {msg.time}</div>
        </div>
      )}

      {msg.messageType === "out" && msg.source === "user_manual" && (
        <div className="chat-box-left">
          <div className="chat-box-fotr-bottom">
            <div className="chat-txt-hed">
              Source: <span className="clr-black">User Manual</span>
              <a
                href={`${BASE_URL}/${msg.doc_url}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: "10px" }}
              >
                Document
              </a>
            </div>
          </div>
          <div className="chat-box-time">Today {msg.time}</div>
        </div>
      )}

      {msg.messageType === "out" && msg.source === "QnA" && (
        <div className="chat-box-left">
          <div className="chat-box-fotr-bottom">
            <div className="chat-txt-hed">
              Source: <span className="clr-black">{msg.source}</span>
            </div>
          </div>
          <div className="chat-box-time">Today {msg.time}</div>
        </div>
      )}

      <div className="loading-spinner loading">
        <BeatLoader color="#C5EBF9" size={12} loading={isLoading} />
      </div>
    </div>
  ),
  (prevProps, nextProps) =>
    prevProps.msg.id === nextProps.msg.id &&
    prevProps.isLoading === nextProps.isLoading
);

// Chat Box  Main Component
const ChatBox = () => {
  const [chatBoxVisible, setChatBoxVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [latestMessageId, setLatestMessageId] = useState(null);

  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);
  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  axios.defaults.baseURL = "http://127.0.0.1:8000";

  console.log(isLoading);

  const handleChatButtonClick = () => setChatBoxVisible(true);
  const handleCloseButtonClick = () => {
    setChatBoxVisible(false);
    localStorage.removeItem("chatMessages");
    setMessages([]);
    setInputValue("");
  };

  console.log(messages);
  const handleModalToggle = () => setModalVisible(!modalVisible);
  const handleInputChange = (e) => setInputValue(e.target.value);

  useEffect(() => {
    const savedMessages =
      JSON.parse(localStorage.getItem("chatMessages")) || [];
    setMessages(savedMessages);
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  };

  const displayMessage = useCallback((message, source, messageType, link, doc_url) => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    // const formattedTime = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    const formattedMessage = message.replace(/\n/g, "<br>");

    // const formattedTime = time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    // console.log(formattedTime);
    const messageObj = {
      message: formattedMessage,
      source: source,
      messageType: messageType,
      link: link,
      id: Date.now(),
      time: `${hours}:${minutes}`,
      doc_url:doc_url,
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, messageObj];
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
      setLatestMessageId(messageObj.id);
      return updatedMessages;
    });
  }, []);

  const sendToBackend = useCallback(
    (userInput) => {
      showLoading();
      fetch("http://103.127.143.141:3000/chatbot/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ user_input: userInput }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          if (data.greet) displayMessage(data.greet, "greet", "greet");
          if (data.QnA) displayMessage(data.QnA, "QnA", "out");
          if (data.gpt_answer)
            displayMessage(data.gpt_answer, "youtube_video", "out", data.link);
          if (data.best_answer)
            displayMessage(data.best_answer, "Suggested_answer", "out");
          if (data.answer_manual)
            displayMessage(data.answer_manual, "user_manual", "out", data.link, data.doc_url);
          hideLoading();
        })
        .catch((error) => {
          displayMessage('Network error: Unable to reach the server.', "greet", "greet");
          hideLoading();
        });
    },
    [displayMessage]
  );
  

  const sendMessage = useCallback(() => {
    if (inputValue.trim() !== "") {
      displayMessage(inputValue, "", "in");
      setInputValue("");
      setLoading(true);
      sendToBackend(inputValue);
    }
  }, [inputValue, displayMessage, sendToBackend]);

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const { scrollHeight, clientHeight } = chatContainer;
      chatContainer.scrollTop = scrollHeight - clientHeight;
    }
  };
  


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div>
      <div className="headline"></div>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="chat-button"
        onClick={handleChatButtonClick}
      >
        <img src={chatbutton} className="pad-25" />
        {showTooltip && (
          <span className="tooltip show">
            <img src={chatlogo} className="chat-log-w" alt="Chat Logo" />
            <p> Hi, Message Me!</p>
          </span>
        )}
      </div>
      <div
        className="chat-box"
        style={{ visibility: chatBoxVisible ? "visible" : "hidden" }}
      >
        <div className="chat-box-header">
          <img src={chatlogo} className="chat-log-w" alt="Chat Logo" />
          <div className="chat-box-header-head">
            RailTel <span className="hmis-assist">HMIS Assist</span>
          </div>
          <p>
            <i
              className="fa fa-times close-btn-sty"
              onClick={handleCloseButtonClick}
            ></i>
          </p>
        </div>
        <div ref={chatContainerRef} className="chat-bot-middlebox">
          {messages.map((msg, index) => (
            <ChatMessage
              msg={msg}
              isLoading={msg.id === latestMessageId && isLoading}
              isLatestMessage={index === messages.length - 1}
            />
          ))}
        </div>
        <ChatInput
          inputValue={inputValue}
          handleInputChange={handleInputChange}
          handleKeyPress={handleKeyPress}
          sendMessage={sendMessage}
        />
      </div>
      <div className="p60"></div>
      <div className={`modal ${modalVisible ? "show-modal" : ""}`}>
        <div className="modal-content">
          <span className="modal-close-button" onClick={handleModalToggle}>
            &times;
          </span>
          <h1>Add What you want here.</h1>
        </div>
      </div>
    </div>
  );
};

// Input Container
const ChatInput = memo(
  ({ inputValue, handleInputChange, handleKeyPress, sendMessage }) => (
    <div className="chat-box-footer">
      <input
        placeholder=" Type here..."
        type="text"
        value={inputValue}
        onKeyDown={handleKeyPress}
        onChange={handleInputChange}
      />
      <i className={`send ${!inputValue.trim() ? "disabled" : ""}`}>
        <img
          src={sendchat}
          className="pad-25"
          alt="Send"
          style={{ cursor: !inputValue.trim() ? "not-allowed" : "pointer" }}
          onClick={sendMessage}
        />
      </i>
    </div>
  )
);

export default ChatBox;

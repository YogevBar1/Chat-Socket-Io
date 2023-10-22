import { useForm } from "react-hook-form";
import MessageModel from "../../../Models/MessageModel";
import socketService from "../../../Services/SocketService";
import "./Demo.css";
import { useEffect, useRef, useState } from "react";

function Demo(): JSX.Element {
    const { register, handleSubmit } = useForm<MessageModel>();

    const [messages, setMessages] = useState<MessageModel[]>([]);

    const [nickname, setNickname] = useState<string>("");

    const [isConnected, setIsConnected] = useState<boolean>(false); // Add this state

    const chatSectionRef = useRef<HTMLDivElement | null>(null); // Ref for chat section

    function connect(): void {

        if (nickname === "") {
            alert("you must enter a nick name if you want to connect!");
            return;
        }

        // Connect to backend socket.io
        socketService.connect((message: MessageModel) => {
            setMessages(arr => [...arr, message]);

        });

        let message: MessageModel = {
            nickname: nickname,
            text: "connected",
            color: "black"
        }
        socketService.send(message);

        setIsConnected(true);
    }

    // Disconnect from server:
    function disconnect(): void {


        if (nickname) {
            let message: MessageModel = {
                nickname: nickname,
                text: "disconnected",
                color: "black"
            }
            socketService.send(message);
        }

        // Add a delay of 1 second before disconnecting
        setTimeout(() => {
            socketService.disconnect();
        }, 10); // 1000 milliseconds = 1 second

        setIsConnected(false);
    }


    // Send message to backend
    function sendMessage(message: MessageModel): void {

        if (message.text === undefined || message.text === "") {
            alert("Message cannot be empty!");
            return;
        }
        socketService.send(message);
        const inputElement = document.getElementById("messageInput") as HTMLInputElement;
        inputElement.value = "";
        inputElement.focus();

    }

    // Update the chat scroll whenever new messages are added
    useEffect(() => {
        if (chatSectionRef.current) {
            chatSectionRef.current.scrollTop = chatSectionRef.current.scrollHeight;
        }
    }, [messages]);


    return (
        <div className="Demo">
            <h1>Socket.io Chat</h1>

            <button onClick={connect} disabled={isConnected}>Connect</button>
            <button onClick={disconnect} disabled={!isConnected}>Disconnect</button>

            <hr />


            <form onSubmit={handleSubmit(sendMessage)}>
                <label>NickName:</label>
                <input  type="text"{...register("nickname")} onChange={(event) => setNickname(event.target.value)} disabled={isConnected} />
                <label>Color:</label>
                <input type="color"{...register("color")} disabled={isConnected} />
                <br />
                <label>Message:</label>
                <input id="messageInput" type="text"{...register("text")} disabled={!isConnected} />
                <button disabled={!isConnected} >Send Message</button>
            </form>

            <section className="chat-section" ref={chatSectionRef}>
                {messages.map((m, idx) => <div key={idx} style={{ color: m.color }}>
                    <span className="nickname">{m.nickname} : </span>
                    <span className="text">{m.text}</span>

                </div>)}
            </section>
        </div>
    );
}

export default Demo;

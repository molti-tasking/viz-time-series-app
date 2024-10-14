import { Form } from "react-router-dom";
import { BabylonScene } from "./app";

export default function Anu() {
  const contact = {
    first: "Your",
    last: "Name",
    avatar: "https://robohash.org/you.png?size=200x200",
    twitter: "your_handle",
    notes: "Some notes",
    favorite: true,
  };

  return (
    <div id="contact">
      <div>
        <h1>I AM ANU</h1>

        <BabylonScene />
      </div>
    </div>
  );
}


import React from 'react'
import { useParams } from 'react-router-dom'
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const RoomPage = () => {

  const { roomId } :any = useParams()

  const myMeeting =async (element:any)=>{
      const appID = 1742857695; ;
      const serverSecret = "bb58e53b67cfcac03b6353d784d63141";
      const kitTocken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        Date.now().toString(),
        "Abhishek"
      );

      const zc = ZegoUIKitPrebuilt.create(kitTocken);

      zc.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: "Copy Link",
            url: `http://localhost:5173/room/${roomId}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showScreenSharingButton: false,
      });

  }


   
  return (
    <div ref={myMeeting} ></div>
  )
}

export default RoomPage
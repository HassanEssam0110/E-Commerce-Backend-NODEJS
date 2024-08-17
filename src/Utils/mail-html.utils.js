export const otpMsgHTML = (otp = "", userName = "", textMessage = "") => {
  return `<div style="font-family: Helvetica,Arial,sans-serif;width="100%";overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">E-commerce App</a>
    </div>
    <p style="font-size:1.1em">Hi,"${userName}"</p>
    <p>${textMessage}</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />E-commerce App</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>E-commerce App Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>`
};

export const MsgHTML = (userName = "", textMessage = "") => {
  return `<div style="font-family: Helvetica,Arial,sans-serif;width="100%";overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">E-commerce App</a>
    </div>
    <p style="font-size:1.1em">Hi,"${userName}"</p>
    <p>${textMessage}</p>
    <p style="font-size:0.9em;">Regards,<br />E-commerce App</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>E-commerce App Inc</p>
      <p>1600 Amphitheatre Parkway</p>
      <p>California</p>
    </div>
  </div>
</div>`
}

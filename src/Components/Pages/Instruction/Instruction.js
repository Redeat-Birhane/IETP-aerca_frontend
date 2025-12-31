import React from "react";
import "./Course.css"; // Reuse the Course.css for consistent styling

const Instructions = () => {
  return (
    <div className="coursePage">
      <header className="introSection">
        <h1>AERCA Law Updates</h1>
        <p>
          Follow these instructions to set up the AERCA Law Update system. 
          This system integrates Arduino hardware with Python-driven legal data 
          retrieval for real-time notifications.
        </p>

        <h2>System Setup Overview:</h2>
        <ul>
          <li>✔ Install Python, VSCode, and Arduino IDE.</li>
          <li>✔ Configure and upload code to your Arduino board.</li>
          <li>✔ Set up the Python virtual environment and dependencies.</li>
          <li>✔ Connect RoboBoy mobile app via Bluetooth.</li>
        </ul>
      </header>

      <section className="courseSection">
        <h2>Setup & Usage Steps</h2>
        
        <div className="courseList">
          {/* Step 1 */}
          <div className="courseCard">
            <h3>1. Software</h3>
            <p>
              Install Python 3.x, VSCode, and Arduino IDE. Get the RoboBoy app on your phone for voice-to-text.
            </p>
          </div>

          {/* Step 2 */}
          <div className="courseCard">
            <h3>2. Arduino</h3>
            <p>
              Select your COM port in IDE and upload the program. Pair with your phone via Bluetooth.
            </p>
          </div>

          {/* Step 3 */}
          <div className="courseCard">
            <h3>3. Python</h3>
            <p>
              Run <code>pip install requests pyserial</code>. Set your <code>SERIAL_PORT</code> in <code>main.py</code>.
            </p>
          </div>

          {/* Step 4 */}
          <div className="courseCard">
            <h3>4. Execution</h3>
            <p>
              Run <code>python main.py</code>. Select a category in the GUI before using voice commands.
            </p>
          </div>

          {/* Step 5 */}
          <div className="courseCard">
            <h3>5. Voice Activation</h3>
            <p>
              Say <strong>"UPDATE"</strong> in RoboBoy. The system will query the backend and display results.
            </p>
          </div>

          {/* Step 6 */}
          <div className="courseCard">
            <h3>6. Completion</h3>
            <p>
              View updates in the GUI. Close the application and disconnect Bluetooth when finished.
            </p>
          </div>
        </div>
      </section>

      <section className="courseSection" style={{ marginTop: '60px' }}>
        <h2>Download Code Files</h2>
        <div className="courseList">
          <div className="courseCard">
            <h3>Python Script</h3>
            <p>Download the main.py execution file.</p>
            <a href="/code/main.py" download style={{ textDecoration: 'none' }}>
               <p>Download</p>
            </a>
          </div>

          <div className="courseCard">
            <h3>Arduino Sketch</h3>
            <p>Download the .ino file for your board.</p>
            <a href="/code/arduino_program.ino" download style={{ textDecoration: 'none' }}>
               <p>Download</p>
            </a>
          </div>

          <div className="courseCard">
            <h3>Full Project</h3>
            <p>Get all files and the README in a ZIP.</p>
            <a href="/code/AERCA_Code.zip" download style={{ textDecoration: 'none' }}>
               <p>Download</p>
            </a>
          </div>
        </div>
      </section>

      <div className="introSection" style={{ marginTop: '40px', borderLeft: '5px solid #ff6f00' }}>
         <p><strong>Note:</strong> Always select the law category in the GUI first. Ensure Python GUI is running and Arduino is connected before sending voice commands.</p>
      </div>
    </div>
  );
};

export default Instructions;
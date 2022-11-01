import { getLogger } from "./log";
import { getCompleteCode } from "./completecode";
import { CONFIG } from "./config";
import { intervalToDuration } from "date-fns";

window.onload = function () {
  let renderRegisteredPopup = function (result) {
    if (result) {
      const contentDiv = document.getElementById("content");
      contentDiv.innerHTML = `<p>Thank you for participating in this study. Your registration code is <b>${result.install_code}</b>.</p>`;
      const sinceInstall = intervalToDuration({
        start: result.install_time,
        end: Date.now(),
      });

      const studyFinished = sinceInstall.days >= CONFIG.studyLengthDays;
      let studyProgressHTML;
      if (studyFinished) {
        studyProgressHTML = `<p>Thank you for your participation. You are now free to uninstall this extension at any time.`;
      } else {
        const days = CONFIG.studyLengthDays - sinceInstall.days;
        studyProgressHTML = `<p>Please keep this extension installed for the next ${days} days.`;
      }

      contentDiv.innerHTML += studyProgressHTML;
    }
  };

  let error = function (err_msg) {
    console.log(err_msg);
    document.getElementById("error_msg").innerHTML = err_msg;
  };

  // Registration flow
  // Save worker ID in chrome storage
  // At this time, also register the treatment group with random sample
  document
    .getElementById("workerIDform")
    .addEventListener("submit", (event) => {
      event.preventDefault();

      let workerID = document.getElementById("workerID").value;
      let treatment_group = Math.floor(Math.random() * 3);

      // validation
      if (!workerID) {
        error("You must enter a respondent ID");
        return;
      }
      const install_code = getCompleteCode(workerID);

      chrome.storage.sync.set(
        {
          workerID: workerID,
          treatment_group: treatment_group,
          install_code: install_code,
          install_time: Date.now(),
          last_recontact: Date.now(),
        },
        function () {
          console.log("Registration completed");

          // Write an installation event to S3 and immediately flush it
          const log = getLogger(workerID, treatment_group);
          log.logEvent({ install_code: install_code }, "install");
          log.flushLog();

          renderRegisteredPopup({
            workerID: workerID,
            install_code: install_code,
            install_time: Date.now(),
            eligible: false,
          });
        }
      );
    });

  chrome.storage.sync.get(
    ["workerID", "install_code", "install_time"],
    function (result) {
      console.log("Default result is ", result);
      if (result.workerID) {
        renderRegisteredPopup(result);
      }
    }
  );
};

//chrome.storage.sync.clear();

const core = require('@actions/core');
const wait = require('./wait');


// most @actions toolkit packages have async methods
async function run() {
  try {
    //Obtained from https://github.com/agrc/reminder-action's action
    const context = github.context.payload;
    const owner = core.getInput("repositoryOwner");
    const repository = core.getInput("repository");
    const octokit = github.getOctokit(
      core.getInput("repoToken", { required: true })
    );

    context.repository = {
      owner,
      name: repository.split("/")[1],
    };

    let issues = [];
    core.startGroup("get open reminder issues");
    for await (const response of octokit.paginate.iterator(
      octokit.rest.issues.listForRepo,
      {
        ...getIssueProps(context),
        state: "open",
        labels: ["unattended"],
      }
    )) {
      issues = issues.concat(response.data);
    }

    if (issues.length < 1) {
      core.info("No unattended issues");
      return;
    }
    core.endGroup();
    
    
    //Sending message reporting issues
    var message = `**The repository ** ${repo} has ${issues.length} unattended issue(s)\n`;
    
    //TODO: Make this its proper action. Also, add the possibility of choosing between forums and teams
    var url = `https://${company}.ryver.com/api/1/odata.svc/forums(${room})/Chat.PostMessage()`;

    var data = {
      createSource: {
        "avatar": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
        "displayName": "GitHub Bot"
      },
      body: message
    };

    var config = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + rvrToken
      }
    }

    sendMessage(url, data, config);
    console.log("== Message Sent? ==");
    //
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function sendMessage(url, data, config) {
    axios
    .post(url, data, config)
    .then(res => {
      console.log(`StatusCode: ${res.status}`)
    })
    .catch(error => {
      console.error(error)
    })
}

run();

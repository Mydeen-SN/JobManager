// LefPane section
ej.base.enableRipple();
var listObj = new ej.lists.ListView({
    select: onSelect
});
var dataset = 1;
//Render initialized ListView component
listObj.appendTo('#left-listview');

listObj.selectItem({ text: 'All Teams' });
var dataSetChanged = false;
var curComponent = 'All Teams';
var totalInProgresssCount = 0;
var totalOpenCount = 0;
var totalClosedCount = 0;
function onSelect(args) {
    dataSetChanged = true;
    curComponent = args.text;
    changeDataSet(curComponent);
}

function changeDataSet(field) {
    var data = [];
    var request = new XMLHttpRequest();
    // Open a new connection, using the GET request on the URL endpoint
    request.open('POST', 'http://172.16.105.10:3000/GetTasks', true);

    request.onload = function () {
        // Begin accessing JSON data here
        var grid = document.getElementById('Grid').ej2_instances[0];
        data = JSON.parse(this.response).result;
        if (curComponent === 'Grid' || curComponent === 'Core' || curComponent === 'Chart') {
            var control = (curComponent === 'Grid') ? 'Grid' : 'Chart';
            if (curComponent === 'Grid') {
                control = 'Grid';
            } else if (curComponent === 'Chart') {
                control = 'Chart';
            } else if (curComponent === 'Core') {
                control = 'Core';
            }
            grid.columns[1].visible = false;
            data = new ej.data.DataManager(data).executeLocal(new ej.data.Query().where("controlName", "equal", control));
            grid.dataSource = data;
            grid.refresh();
        } else {
            grid.dataSource = data;
            grid.columns[1].visible = true;
            grid.refresh();
        }

        var openStatus = new ej.data.DataManager(data).executeLocal(new ej.data.Query().where("status", "equal", "Open"));
        var closedStatus = new ej.data.DataManager(data).executeLocal(new ej.data.Query().where("status", "equal", "Closed"));
        var inProgressStatus = new ej.data.DataManager(data).executeLocal(new ej.data.Query().where("status", "equal", "InProgress"));

        if (curComponent !== 'Grid' && curComponent !== 'Chart' && curComponent !== 'Core') {
            totalInProgresssCount = inProgressStatus.length;
            totalOpenCount = openStatus.length;
            totalClosedCount = closedStatus.length;
        } else {
            totalInProgresssCount = new ej.data.DataManager(inProgressStatus).executeLocal(new ej.data.Query().where("controlName", "equal", curComponent)).length;
            totalOpenCount = new ej.data.DataManager(openStatus).executeLocal(new ej.data.Query().where("controlName", "equal", curComponent)).length;
            totalClosedCount = new ej.data.DataManager(closedStatus).executeLocal(new ej.data.Query().where("controlName", "equal", curComponent)).length;
        }
        pie.series[0].dataSource = [
            { 'x': 'inProgress', y: totalInProgresssCount, text: 'InProgress Task Count: ' + totalInProgresssCount.toString() },
            { 'x': 'closed', y: totalOpenCount, text: 'Closed Task Count: ' + totalClosedCount.toString() },
            { 'x': 'open', y: totalClosedCount, text: 'Open Task Count: ' + totalOpenCount.toString() }
        ]
        pie.title = 'Task Status for ' + curComponent + ' Component'
    }

    // Send request
    request.send();
}
// var data = new ej.data.DataManager({ url: 'http://172.16.105.10:3000/GetTasks', adaptor: new ej.data.RemoteSaveAdaptor, crossDomain: true });
var grid = new ej.grids.Grid({
    dataSource: [],
    height: 435,
    // detailTemplate: '#detailtemplate',
    editSettings: { allowEditing: true, allowAdding: true, allowDeleting: true, mode: 'Dialog', template: '#dialogtemplate' },
    allowTextWrap: true,
    sortSettings: { columns: [{ field: 'issuePriority', direction: 'Ascending' }] },
    allowSorting: true,
    columns: [
        { field: '_id', headerText: 'ID', visible: false, width: 120, textAlign: 'Right', isPrimaryKey: true },
        { field: 'controlName', headerText: 'Control Name', width: 120, },
        { field: 'issuePriority', visible: false, width: 120, textAlign: 'Right' },
        { field: 'title', width: 120, headerTemplate: '#titletemplate' },
        { field: 'issueType', headerText: 'Issue Type', width: 100 },
        { field: 'dueDate', headerText: 'No of Days Remaining', width: 120, textAlign: 'center' },
        { field: 'status', headerText: 'Status', width: 130, textAlign: 'Center', template: "#statusTemplate", headerTemplate: '#statusheadertemplate' },
        {
            headerText: 'Priority', field: "reportTeamPriority", headerTemplate: '#prioritytemplate',
            template:
                `
<div class="progress">
  <div class="progress-bar" role="progressbar" style="width: 20%;" aria-valuenow="10" aria-valuemin="0" aria-valuemax="10">2</div>
</div>`, width: 140
        },
        {
            headerText: 'Manage Records', width: 120, headerTemplate: '#commandtemplate',
            commands: [{ type: 'Edit', buttonOption: { iconCss: ' e-icons e-edit', cssClass: 'e-flat' } }]
        }
    ],
    actionComplete: function (args) {
        if (args.requestType === 'beginEdit') {
            var data = args.rowData;
            // Convert Widget for the Freight field
            new ej.inputs.NumericTextBox({ value: data.reportTeamPriority, placeholder: 'ReportTeamPriority', floatLabelType: 'Always' },
                args.form.elements.namedItem('reportTeamPriority'));

            new ej.dropdowns.DropDownList({
                value: data.status, popupHeight: '300px', floatLabelType: 'Always',
                dataSource: ["Open", "InProgress", "Validated", "Closed"], placeholder: 'Status'
            },
                args.form.elements.namedItem('status'));

            // Convert Widget for the OrderDate field
            new ej.calendars.DatePicker({ value: data.dueDate, placeholder: 'DueDate', floatLabelType: 'Always' },
                args.form.elements.namedItem('dueDate'));
        }
        if (args.requestType === 'save') {

            var data = JSON.stringify(args.data);
            var ajax = new ej.base.Ajax({
                url: 'http://172.16.105.10:3000/upateTask/' + args.data._id,
                type: 'POST',
                data: data
            });
            ajax.send();
        }

    },
    queryCellInfo(args) {
        if (args.column.field === "status" && args.data[args.column.field] === "Closed") {
            args.cell.querySelector(".statustxt").classList.add("e-activecolor");
            args.cell.querySelector(".statustemp").classList.add("e-activecolor");
        } if (args.column.field === "status" && args.data[args.column.field] === "Open") {
            args.cell.querySelector(".statustxt").classList.add("e-inactivecolor");
            args.cell.querySelector(".statustemp").classList.add("e-inactivecolor");
        } if (args.column.field === "status" && args.data[args.column.field] === "InProgress") {
            args.cell.querySelector(".statustxt").classList.add("e-inprogresscolor");
            args.cell.querySelector(".statustemp").classList.add("e-inprogresscolor");
        } if (args.column.field === "status" && args.data[args.column.field] === "Validated") {
            args.cell.querySelector(".statustxt").classList.add("e-validatecolor");
            args.cell.querySelector(".statustemp").classList.add("e-validatecolor");
        } if (args.column.field === "reportTeamPriority") {
            args.cell.innerHTML = '<div class="progress"><div class="progress-bar" role="progressbar" style="width:' + args.data.reportTeamPriority * 10 + '%;" aria-valuenow="10" aria-valuemin="0" aria-valuemax="10">' + args.data.reportTeamPriority + '</div></div>';
        } if (args.column.field === "dueDate") {
            var date1 = new Date(args.data.dueDate);
            var date2 = new Date(args.data.createdAt);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            args.cell.innerHTML = '<span>' + diffDays + " " + "days" + '</span>'
        }
    }
});
grid.appendTo('#Grid');

function myFunction(args) {
    var grid = document.getElementById('Grid').ej2_instances[0];
    if (args.value) {
        var data = new ej.data.DataManager(grid.dataSource).executeLocal(new ej.data.Query().where("controlName", 'startswith', args.value));
        grid.dataSource = data;
        grid.refresh();
    } else {
        changeDataSet(curComponent);
    }
}

var button = new ej.buttons.Button({ isPrimary: true });
button = new ej.buttons.Button({ cssClass: 'e-big e-round', isPrimary: true });
button.appendTo('#roundbtn');

var button = new ej.buttons.Button({ isPrimary: true });
button = new ej.buttons.Button({ cssClass: 'e-small e-round chartview', isPrimary: true });
button.appendTo('#chart');

var promptDialogObj = new ej.popups.Dialog({
    header: 'Add new task',
    visible: false,
    showCloseIcon: false,
    closeOnEscape: false,
    isModal: true,
    buttons: [{
        click: DialogBtnClik, buttonModel: { content: 'Save', value: 'Submit', isPrimary: true }
    },
    {
        click: DialogBtnClik, buttonModel: { content: 'Cancel' }
    }],
    width: '800px',
});
promptDialogObj.appendTo('#promptDialog');

var chartDiaogObj = new ej.popups.Dialog({
    header: '',
    visible: false,
    showCloseIcon: true,
    closeOnEscape: true,
    isModal: true,
    // buttons: [{
    //     click: DialogBtnClik, buttonModel: { content: 'Save', value: 'Submit', isPrimary: true }
    // },
    // {
    //     click: DialogBtnClik, buttonModel: { content: 'Cancel' }
    // }],
    width: '800px',
});
chartDiaogObj.appendTo('#chartDialog');

var saveDialog = new ej.popups.Dialog({
    visible: false,
    showCloseIcon: false,
    closeOnEscape: false,
    isModal: true,
    width: '100px',
});
saveDialog.appendTo('#save-icon');

document.getElementById("roundbtn").addEventListener("click", function (args) {
    if (document.getElementById("promptDialog").style.display === "none") {
        document.getElementById("promptDialog").style.display = "";
    }
    document.getElementById("form-validator").reset();
    IssuePriorityDropDown.index = IssueTypeDropDown.index = listObj.index = null;
    IssuePriorityDropDown.index = IssueTypeDropDown.index = listObj.index = 0;


    promptDialogObj.show();
});

document.getElementById("chart").addEventListener("click", function (args) {
    if (document.getElementById("chartDialog").style.display === "none") {
        document.getElementById("chartDialog").style.display = "";
    }
    // document.getElementById("form-validator").reset();
    // IssuePriorityDropDown.index = IssueTypeDropDown.index = listObj.index = null;
    // IssuePriorityDropDown.index = IssueTypeDropDown.index = listObj.index = 0;


    // promptDialogObj.show();
    chartDiaogObj.show();
});

var listObj = new ej.dropdowns.DropDownList({
    popupHeight: '200px',
    width: '200px'
});
listObj.appendTo('#Controls');

var IssueTypeDropDown = new ej.dropdowns.DropDownList({
    popupHeight: '200px',
    width: '200px'
});
IssueTypeDropDown.appendTo('#issueType');

var IssuePriorityDropDown = new ej.dropdowns.DropDownList({
    placeholder: 'Select Priority',
    popupHeight: '200px',
    width: '200px'
});
IssuePriorityDropDown.appendTo('#Priority');

function DialogBtnClik(args) {
    var validation = {
        rules: {
            title: { required: true },
            Assignee: { required: true },
            Description: { required: true },
            Reporter: { required: true }
        }
    };
    var formObj = new ej.inputs.FormValidator("#form-validator", validation);
    if (args.target.innerHTML == "Save" && formObj.validate()) {
        var issuePriority = 0;
        var iType = document.getElementById("issueType").ej2_instances[0].value;
        var obj = {
            "Build Failure": 1,
            "Bug": 2
        }
        issuePriority = obj[iType] || 3;
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + dataset);
        dataset++;
        var value = {
            "title": document.getElementById("title").value, "controlName": document.getElementById("Controls").ej2_instances[0].value,
            "issueType": iType, "reportTeamPriority": parseInt(document.getElementById("Priority").ej2_instances[0].value),
            "assignee": document.getElementById("Assignee").value, "reporter": document.getElementById("Reporter").value,
            "description": document.getElementById("Description").value, "status": "Open", "issuePriority": issuePriority, "dueDate": tomorrow
        }
        debugger
        var data = JSON.stringify(value);
        var ajax = new ej.base.Ajax({
            url: 'http://172.16.105.10:3000/tasks',
            type: 'POST',
            data: data
        });
        ajax.send();
        promptDialogObj.hide();
        saveDialog.show();
        setTimeout(() => {
            saveDialog.hide();
            changeDataSet(curComponent)
        }, 800);
    }
    if (args.target.innerHTML == "Cancel") {
        promptDialogObj.hide();
    }
}
var totalCount = totalInProgresssCount + totalClosedCount + totalOpenCount;
var inProgressPercent = (totalInProgresssCount / totalCount) * 100;
var openPercent = (totalOpenCount / totalCount) * 100;
var closedPercent = (totalClosedCount / totalCount) * 100;

var pie = new ej.charts.AccumulationChart({
    series: [
        {
            dataSource: [
                { 'x': 'inProgress', y: inProgressPercent, text: 'InProgress Task Count: ' + totalInProgresssCount.toString() },
                { 'x': 'closed', y: closedPercent, text: 'Closed Task Count: ' + totalClosedCount.toString() },
                { 'x': 'open', y: openPercent, text: 'Open Task Count: ' + totalOpenCount.toString() }
            ],
            dataLabel: {
                visible: true,
                position: 'Outside',
                name: 'text',
                font: {
                    fontWeight: '600'
                }
            },
            radius: '70%', xName: 'x',
            yName: 'y', startAngle: 0,
            endAngle: 360, innerRadius: '0%',
            explodeOffset: '10%', explodeIndex: 0, name: 'Browser'
        }
    ],
    center: { x: '55%', y: '50%' },
    title: 'Task Status for ' + curComponent + ' Component'
});
pie.appendTo('#pie-container');
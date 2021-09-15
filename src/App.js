import React, { Component, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import XLSX from 'xlsx';
// import excel from 'xlsx';
// let fileName = "newData.xlsx";
// let workbook = excel.readFile(fileName);

const categories = [
  "Auto & Transport",
  "Bills & Utilities",
  "Business Services",
  "Education",
  "Entertainment",
  "Fees & Charges",
  "Financial",
  "Food & Dining",
  "Gifts & Donations",
  "Health & Fitness",
  "Home",
  "Income",
  "Investments",
  "Kids",
  "Personal Care",
  "Pets",
  "Shopping",
  "Taxes",
  "Transfer",
  "Travel",
  "Uncategorized"
];

const subCatMapping = {
  "Auto & Transport": 0,
  "Auto Insurance": 0,
  "Auto Payment": 0,
  "Gas & Fuel": 0,
  "Parking": 0,
  "Public Transportation": 0,
  "Registration": 0,
  "Service & Parts": 0,
  "Bills & Utilities": 1,
  "Internet": 1,
  "Mobile Phone": 1,
  "Television": 1,
  "Utilities": 1,
  "Business Services": 2,
  "Legal": 2,
  "Shipping": 2,
  "Office Supplies": 2,
  "Tax Services": 2,
  "Education": 3,
  "Tuition": 3,
  "Amusement": 4,
  "Arts": 4,
  "Dating": 4,
  "Entertainment": 4,
  "Movies & DVDs": 4,
  "Music": 4,
  "Bank Fee": 5,
  "Finance Charge": 5,
  "Late Fee": 5,
  "Service Fee": 5,
  "Financial": 6,
  "Financial Advisor": 6,
  "Alcohol & Bars": 7,
  "Coffee Shops": 7,
  "Dessert": 7,
  "Fast Food": 7,
  "Food & Dining": 7,
  "Groceries": 7,
  "Restaurants": 7,
  "Charity": 8,
  "Gift": 8,
  "Dentist": 9,
  "Doctor": 9,
  "Eyecare": 9,
  "Gym": 9,
  "Health & Fitness": 9,
  "Pharmacy": 9,
  "Sports": 9,
  "Furnishings": 10,
  "Home Improvement": 10,
  "Home Insurance": 10,
  "Home Supplies": 10,
  "Mortgage & Rent": 10,
  "Rent": 10,
  "Home": 10,
  "Home Services": 10,
  "Income": 11,
  "Interest Income": 11,
  "Bonus": 11,
  "Paycheck": 11,
  "Reimbursement": 11,
  "Buy": 12,
  "Stock": 12,
  "Baby Supplies": 13,
  "Child Support": 13,
  "Kids": 13,
  "Kids Activities": 13,
  "Toys": 13,
  "Hair": 14,
  "Laundry": 14,
  "Personal Care": 14,
  "Spa & Massage": 14,
  "Pet Food & Supplies": 15,
  "Books": 16,
  "Clothing": 16,
  "Electronics & Software": 16,
  "Shopping": 16,
  "Federal Tax": 17,
  "Property Tax": 17,
  "State Tax": 17,
  "Taxes": 17,
  "Credit Card Payment": 18,
  "Transfer": 18,
  "Transfer for Cash Spending": 18,
  "Air Travel": 19,
  "Hotel": 19,
  "Rental Car & Taxi": 19,
  "Travel": 19,
  "Vacation": 19,
  "Cash & ATM": 20,
  "Check": 20,
  "Uncategorized": 20
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {},
      data: [],
      cols: [],
      chosen: "",
      toggleTxOn: false
    }
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange = (e) => {
    // console.log("test", e.target.files);
    const files = e.target.files;
    if (files && files[0]) this.setState({ file: files[0] });

    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
 
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, {
        type: rABS ? 'binary' : 'array',
        raw: true,
        bookVBA : false
        // cellDates: true,
        // cellText: true
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      let data = XLSX.utils.sheet_to_json(ws, {
        // range: "A:I",
        header: true
      });
      data = this.transformData(data);
      /* Update state */
      this.setState({ data: data, cols: this.make_cols(ws['!ref']) });
      // , () => {
      //   console.log(JSON.stringify(this.state.data, null, 2));
      // });
    };
 
    if (rABS) {
      reader.readAsBinaryString(files[0]);
    } else {
      reader.readAsArrayBuffer(files[0]);
    };
  }
  make_cols = refstr => {
    let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
    for(var i = 0; i < C; ++i) o[i] = {name:XLSX.utils.encode_col(i), key:i}
    return o;
  }
  transformData = (data) => {
    let output = {};
    for (let i=0; i<data.length; i++) {
      if (data[i]["Transaction Type"] === "credit") {
        data[i]["Amount"] = data[i]["Amount"];
      } else {
        data[i]["Amount"] = -(Number(data[i]["Amount"]));
      }
      delete data[i]["Transaction Type"];

      const date = new Date(data[i].Date);
      data[i].Date = date;
      const month = date.getMonth()+1;
      const key = `${date.getFullYear()}${month < 10 ? "0"+month : month }`;

      if (output.hasOwnProperty(key)) {
        output[key].push(data[i]);
      } else {
        output[key] = [data[i]];
      }
    }
    return output;
  }
  checkFileType = (event) => {
    //getting file object
    let files = event.target.files 
    //define message container
    let err = ''
    // list allow mime type
    const types = ['image/png', 'image/jpeg', 'image/gif']
    // loop access array
    for(var x = 0; x<files.length; x++) {
      // compare file type find doesn't matach
          if (types.every(type => files[x].type !== type)) {
          // create error message and assign to container   
          err += files[x].type+' is not a supported format\n';
        }
      };

    if (err !== '') { // if message not same old that mean has error 
        event.target.value = null; // discard selected file
        console.log(err);
        return false; 
    }
    return true;
  }
  formatCurrency(num) {
    let decimal = Number(num).toFixed(2).split('.')[1];
    return num.toLocaleString('en-US').split('.')[0] + '.' + decimal;
  }
  renderByCategories() {
    if (!this.state.chosen) return null;
    let res = {};
    for (let row of this.state.data[this.state.chosen]) {
      if (subCatMapping.hasOwnProperty(row.Category)) {
        const idx = subCatMapping[row.Category];
        const catName = categories[idx];
        if (res.hasOwnProperty(catName)) {
          res[catName].total += +row.Amount;
          if (res[catName].subCat.hasOwnProperty(row.Category)) {
            res[catName].subCat[row.Category] += +row.Amount;
          } else {
            res[catName].subCat[row.Category] = +row.Amount;
          }
        } else {
          res[catName] = {
            total: +row.Amount,
            subCat: {[row.Category]: +row.Amount}
          };
        }
      }
      else {
        //error-category not in mapping
        if (res.hasOwnProperty("non-matching categories")) {
          res["non-matching categories"].total += +row.Amount;
          if (res["non-matching categories"].subCat.hasOwnProperty(row.Category)) {
            res["non-matching categories"].subCat[row.Category] += +row.Amount;
          } else {
            res["non-matching categories"].subCat[row.Category] = +row.Amount;
          }
        } else {
          res["non-matching categories"] = {
            total: +row.Amount,
            subCat: {[row.Category]: +row.Amount}
          };
        }
      }
    }
    let inc = 0, exp = 0;
    const outputJSX = Object.keys(res)
      .map(k => {
        return {key: k, ...res[k]};
      })
      .sort((a,b) => {
        return b.total - a.total;
      })
      .map((obj, idx) => {
        if (obj.total<0) exp += obj.total;
        else inc += obj.total;
        return (
          <div key={idx} className="categories">
            <span className="underline"><b>{obj.key}</b></span>
            <span className="underline">{this.formatCurrency(obj.total)}</span>
            {Object.keys(obj.subCat).length && Object.keys(obj.subCat).map((sub, i) => {
              return (
                <div key={i}>
                  <span>{sub}</span>
                  <span>{this.formatCurrency(obj.subCat[sub])}</span>
                </div>
              );
            })}
          </div>
        );
      });
    return (
      <Fragment>
        <div>Income: <span className="green">{this.formatCurrency(inc)}</span></div>
        <div>Expense: <span className="red">{this.formatCurrency(exp)}</span></div>
        <div><b>Net: <span className={(exp+inc)>0 ? "green" : "red"}>{this.formatCurrency(exp+inc)}</span></b></div>
        <div className="results-pane-byCat">
          {outputJSX}
        </div>
      </Fragment>
    );
  }
  renderTransactions() {
    if (!this.state.chosen) return null;
    return this.state.data[this.state.chosen].map((row, idx) => {
      // console.log("at idx ",idx);
      // console.log("row ",row);
      return (
        <div key={idx}>
          <span>{`${row.Date.getMonth()+1}/${row.Date.getDate()}/${row.Date.getFullYear()}`}</span>
          <span>{row.Description}</span>
          <span>{this.formatCurrency(row.Amount)}</span>
          <span>{row.Category}</span>
          <span>{row["Account Name"]}</span>
          <span>{row.Labels}</span>
          <span>{row.Notes}</span>
        </div>
      );
    });
  }
  renderBtn() {
    const arrOfKeys = Object.keys(this.state.data);
    if (!arrOfKeys.length) return null;
    return arrOfKeys.map(k =>
      <button
        key={k}
        className={`btn btn${this.state.chosen===k ? "": "-outline"}-secondary`}
        onClick={() => {
          this.setState({
            chosen: k,
            toggleTxOn: this.state.chosen===k && !this.state.toggleTxOn
          });
        }}
      >
        {k}
      </button>);
  }
  render() {
    return (
      <div className="App">
        <div className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h2>finance</h2>
        </div>
        <div className="header-pane">
          {/* <div class="input-group mb-3 col-sm-6">
            <div class="input-group-prepend">
              <span class="input-group-text" id="inputGroupFileAddon01">Upload</span>
            </div>
            <div class="custom-file">
              <input
                type="file"
                class="custom-file-input"
                id="inputGroupFile01"
                aria-describedby="inputGroupFileAddon01"
                accept={".xlsx, .xlsb, .xlsm, .xls, .csv, .txt"}
                onChange={this.handleChange} />
              <label class="custom-file-label" for="inputGroupFile01">Choose an Excel file</label>
            </div>
          </div> */}
          <label htmlFor="file">Download transactions.csv from mint.com then upload to view your monthly breakdowns</label>
          <br />
          <input
            type="file"
            className="form-control"
            id="file"
            accept={".xlsx, .xlsb, .xlsm, .xls, .csv, .txt"}
            onChange={this.handleChange} />
          {/* <br />
          <input
            type="submit" 
            value="Process File"
            onClick={this.processFile} /> */}
        </div>
        <div className="main-pane">
          {this.renderBtn()}
          {this.state.chosen &&
            <div className="results-pane-title">
              <b>{`${this.state.chosen.substr(4)}/${this.state.chosen.substr(0,4)}`}</b>
            </div>
          }
          <div className="results-pane">
            {this.state.toggleTxOn && this.renderTransactions()}
            {!this.state.toggleTxOn && this.renderByCategories()}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

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
  "Uncategorized",
  "One-Off"       //internal category to separate non-recurring or at least non-monthly-recurring charges
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
  "Car Wash": 0,
  "Ride Share": 0,
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
  "Food Delivery": 7,
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
  "Lawn & Garden": 10,
  "Income": 11,
  "Interest Income": 11,
  "Bonus": 11,
  "Paycheck": 11,
  "Reimbursement": 11,
  "Buy": 12,
  "Stock": 12,
  "Turo": 12,
  "Estepona": 12,
  "LickMill": 12,
  "Baby Supplies": 13,
  "Child Support": 13,
  "Kids": 13,
  "Kids Activities": 13,
  "Toys": 13,
  "An": 13,
  "Danny": 13,
  "Hair": 14,
  "Laundry": 14,
  "Personal Care": 14,
  "Spa & Massage": 14,
  "Pet Food & Supplies": 15,
  "Books": 16,
  "Clothing": 16,
  "Electronics & Software": 16,
  "Shopping": 16,
  "Sporting Goods": 16,
  "Hobbies": 16,
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
      data: {},
      cols: [],
      chosen: "",
      toggleTxOn: false,
      oneoff: {},
      oneoffCnt: 0
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick = (e, row, idx, addToOneOff) => {
    console.log("e= ",e);
    console.log("row= ",row);
    console.log("idx= ",idx);
    console.log("addToOneOff= ",addToOneOff);
    if (addToOneOff) {
      let oneOffTxBeingAdded = this.state.data[this.state.chosen].splice(idx, 1)[0]; //TODO: account for [] when it's the last one to be removed
      console.log("oneofftxBeingAdded= ",oneOffTxBeingAdded);
      if (this.state.oneoff.hasOwnProperty(this.state.chosen)) {        //issue - oneoff gets wiped!!!
        this.state.oneoff[this.state.chosen].push(oneOffTxBeingAdded);
        this.setState({oneoff: this.state.oneoff, oneoffCnt: this.state.oneoffCnt+1});
      } else {
        this.setState({oneoff:{[this.state.chosen]: [oneOffTxBeingAdded]}, oneoffCnt: this.state.oneoffCnt+1});
      }
    } else {
      let oneOffTxBeingRemoved = this.state.oneoff[this.state.chosen].splice(idx, 1)[0];
      console.log("oneOffTxBeingRemoved= ",oneOffTxBeingRemoved);
      //assuming that category is there, since it initially came from reg tx
      this.state.data[this.state.chosen].push(oneOffTxBeingRemoved); //need to sort
      this.setState({data: this.state.data, oneoffCnt: this.state.oneoffCnt-1});
    }
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
      const dateAsKey = `${date.getFullYear()}${month < 10 ? "0"+month : month }`;

      if (output.hasOwnProperty(dateAsKey)) {
        output[dateAsKey].push(data[i]);
      } else {
        output[dateAsKey] = [data[i]];
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
    console.log("renderByCategories");
    if (!this.state.chosen) return null;
    let res = {};

    // if (this.state.oneoffCnt>0) {
    if (this.state.oneoff.hasOwnProperty(this.state.chosen)) {
      res["One-Off"] = { total: 0, subCat: {} };

      for (let row of this.state.oneoff[this.state.chosen]) {
        if (subCatMapping.hasOwnProperty(row.Category)) {
          const idx = subCatMapping[row.Category];
          const catName = categories[idx];
          
          res["One-Off"].total += +row.Amount;
          if (res["One-Off"].subCat.hasOwnProperty(catName)) {
            res["One-Off"].subCat[catName] += +row.Amount;
            // if (res["One-Off"][catName].subCat.hasOwnProperty(row.Category)) {
            //   res["One-Off"][catName].subCat[row.Category] += +row.Amount;
            // } else {
            //   res["One-Off"][catName].subCat[row.Category] = +row.Amount;
            // }
          } else {
            res["One-Off"].subCat[catName] = 
            // {
            //   total: +row.Amount,
            //   subCat: {[row.Category]: +row.Amount}
            // };
            +row.Amount;
          }
        } else {
          if (res["One-Off"].subCat.hasOwnProperty("non-matching categories")) {
            res["One-Off"].subCat["non-matching categories"] += +row.Amount;
            // if (res["non-matching categories"].subCat.hasOwnProperty(row.Category)) {
            //   res["non-matching categories"].subCat[row.Category] += +row.Amount;
            // } else {
            //   res["non-matching categories"].subCat[row.Category] = +row.Amount;
            // }
          } else {
            res["One-Off"].subCat["non-matching categories"] = 
            // {
            //   total: +row.Amount,
            //   subCat: {[row.Category]: +row.Amount}
            // };
            +row.Amount;
          }
        }
      }
    }

    // res(View Model) = {
    //   category1: {
    //     total: x,
    //     subCat: {
    //       subCategory1: xx,
    //       subCategory2: yy,
    //       ...
    //     }
    //   },
    //   ...
    // }
    for (let row of this.state.data[this.state.chosen]) {
      if (subCatMapping.hasOwnProperty(row.Category)) {
        const idx = subCatMapping[row.Category];
        const catName = categories[idx];

        // if (this.state.oneoffCnt>0 && this.state.oneoff.hasOwnProperty(this.state.chosen)) {
          // res["One-Off"].total += +row.Amount;
          // if (res["One-Off"].subCat.hasOwnProperty(catName)) {
          //   res["One-Off"].subCat[catName] += +row.Amount;
          //   // if (res["One-Off"][catName].subCat.hasOwnProperty(row.Category)) {
          //   //   res["One-Off"][catName].subCat[row.Category] += +row.Amount;
          //   // } else {
          //   //   res["One-Off"][catName].subCat[row.Category] = +row.Amount;
          //   // }
          // } else {
          //   res["One-Off"].subCat[catName] = 
          //   // {
          //   //   total: +row.Amount,
          //   //   subCat: {[row.Category]: +row.Amount}
          //   // };
          //   +row.Amount;
          // }
        // } else {
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
        // }

      } else {
        //error-category not in mapping

        // if (this.state.oneoffCnt>0) {
          // if (res["One-Off"].subCat.hasOwnProperty("non-matching categories")) {
          //   res["One-Off"].subCat["non-matching categories"] += +row.Amount;
          //   // if (res["non-matching categories"].subCat.hasOwnProperty(row.Category)) {
          //   //   res["non-matching categories"].subCat[row.Category] += +row.Amount;
          //   // } else {
          //   //   res["non-matching categories"].subCat[row.Category] = +row.Amount;
          //   // }
          // } else {
          //   res["One-Off"].subCat["non-matching categories"] = 
          //   // {
          //   //   total: +row.Amount,
          //   //   subCat: {[row.Category]: +row.Amount}
          //   // };
          //   +row.Amount;
          // }

        // } else {
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
        // }
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
        console.log("obj= ",obj);
        if (obj.key !== "One-Off") {
          if (obj.total<0) exp += obj.total;
          else inc += obj.total;  // TODO: be able to select category to either add to/remove from total
        }
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
    console.log("renderTransactions");
    if (!this.state.chosen) return null;
    console.log("this.state.oneoff",this.state.oneoff);
    console.log("this.state.oneoffCnt",this.state.oneoffCnt);
    return (
      <Fragment>
        <div className="results-tx-left-subpane">
          <span className="underline"><b>One-Off transactions</b></span>
          {this.state.oneoff[this.state.chosen] && this.state.oneoff[this.state.chosen].map((row, idx) => {
            return (
              <div key={idx}>
                <i className="arrow-left-circle" role="img"></i>
                <div className="minus-sign" onClick={(e) => this.handleClick(e,row,idx,false)}>-&nbsp;</div>
                <span>{`${row.Date.getMonth()+1}/${row.Date.getDate()}/${row.Date.getFullYear()}`}</span>
                <span>{row.Description}</span>
                <span>{this.formatCurrency(row.Amount)}</span>
                <span>{row.Category}</span>
                {/* <span>{row["Account Name"]}</span>
                <span>{row.Labels}</span>
                <span>{row.Notes}</span> */}
              </div>
            );
          })}
        </div>
        <div className="results-tx-right-subpane">
          {this.state.data[this.state.chosen].map((row, idx) => {
            // console.log("at idx ",idx);
            // console.log("row ",row);
            return (
              <div key={idx}>
                <i className="arrow-left-circle" role="img"></i>
                <div className="plus-sign" onClick={(e) => this.handleClick(e,row,idx,true)}>+&nbsp;</div>
                <span>{`${row.Date.getMonth()+1}/${row.Date.getDate()}/${row.Date.getFullYear()}`}</span>
                <span>{row.Description}</span>
                <span>{this.formatCurrency(row.Amount)}</span>
                <span>{row.Category}</span>
                <span>{row["Account Name"]}</span>
                <span>{row.Labels}</span>
                <span>{row.Notes}</span>
              </div>
            );
          })}
        </div>
      </Fragment>
    );
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
  render() {      //TODO: left pane to separate one-off or annual to the side, maybe w/ an option to either include/exclude from total
                  //TODO: top pane to store flagged tx for later review
    console.log("render, this.state.data= ", this.state.data);
    console.log("render, this.state.oneoff= ", this.state.oneoff);
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
              {/* title as date */}
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

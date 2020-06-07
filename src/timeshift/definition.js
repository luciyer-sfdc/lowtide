class Branch {

  constructor({
    input_ds = "input_dataset",
    output_ds = false,
    lp_date = "2020-01-01",
    date_fields = []
  }) {

    this.input_name = input_ds;
    this.output_name = output_ds ? output_ds : input_ds;
    this.fields = date_fields;
    this.last_processed = new Date(lp_date);

    this.load = this.setLoad();
    this.compute = this.computeDates(this.load.name);
    this.clear = this.dropDates(this.compute.name);
    this.shift = this.shiftDates(this.clear.name);
    this.clean = this.dropAux(this.shift.name);
    this.register = this.setRegister(this.clean.name);

    this.nodes = ["load", "compute", "clear", "shift", "clean", "register"];

  }

  seedName (s) { return `${s}_${this.input_name}`; }

  termAux (s) { return `${s}_Aux`; }
  termEpoch (s) { return `toDate('${s}_sec_epoch')`; }
  termShift (s) { return `toDate('${s}_sec_epoch' + 'ElapsedSeconds')`; }

  get calcEpoch () { return this.last_processed.getTime() / 1e3; }
  get elapsedExp () {
    return `86400 * date_diff("day", toDate(${this.calcEpoch}), now())`;
  }

  setLoad () {
    return new Load(this.seedName("Load_Dataset"), this.input_name);
  }

  computeDates(source) {
    var fields = [];
    fields.push(new ComputedField("Numeric", "ElapsedSeconds", null, this.elapsedExp));
    this.fields.forEach(d => fields.push(new ComputedField("Date", this.termAux(d.api_name), null, this.termEpoch(d.api_name))));
    return new Compute(this.seedName("Compute_Aux"), source, fields);
  }

  dropDates(source) {
    var fields = this.fields.map(d => d.api_name);
    return new Slice(this.seedName("Drop_Dates"), source, fields);
  }

  shiftDates(source) {
    var fields = [];
    fields.push(new ComputedField("Date", "LastProcessedDate", "Last Processed", "now()"));
    this.fields.forEach(d => fields.push(new ComputedField("Date", d.api_name, d.label, this.termShift(this.termAux(d.api_name)))));
    return new Compute(this.seedName("Shift_Dates"), source, fields);
  }

  dropAux(source) {
    var fields = this.fields.map(d => this.termAux(d.api_name));
    fields.push("ElapsedSeconds");
    return new Slice(this.seedName("Drop_Aux"), source, fields);
  }

  setRegister (source) {
    return new Register(this.seedName("Register_Shifted_Dataset"), source, this.output_name);
  }

  get object() {
    var temp = {};
    this.nodes.forEach(n => temp[this[n].name] = this[n].block);
    return temp;
  }

  get json() {
    return JSON.stringify(this.object);
  }

}


class Node {

  constructor(name) {
    this.name = name;
    this.block = {
        action: null,
        parameters: {}
    };
  }

  get node() {
    var outer = {};
    outer[this.name] = Object.assign({}, this);
    return outer;
  }

  get json() {
    return JSON.stringify(this.outer);
  }

}


class Load extends Node {
  constructor(name, alias) {
    super(name);
    this.block.action = "edgemart";
    this.block.parameters.alias = alias;
  }
}

class Register extends Node {
  constructor(name, source, output_name) {
    super(name);
    this.block.action = "sfdcRegister";
    this.block.parameters.source = source;
    this.block.parameters.alias = output_name;
    this.block.parameters.name = output_name;
  }
}

class Slice extends Node {
  constructor(name, source, field_array) {
    super(name);
    this.block.action = "sliceDataset";
    this.block.parameters.mode = "drop";
    this.block.parameters.source = source;
    this.block.parameters.fields = field_array.map(d => ({ "name" : d }));
  }
}

class Compute extends Node {
  constructor(name, source, computed_field_array) {
    super(name);
    this.block.action = "computeExpression";
    this.block.parameters.source = source;
    this.block.parameters.mergeWithSource = true;
    this.block.parameters.computedFields = [];
    this.block.parameters.computedFields = computed_field_array.map(d => d.object);
  }
}

class ComputedField {

  constructor(type, name, label, saql_exp) {

    this.type = type;
    this.name = name;
    this.label = label || name;

    if (type === "Date") {
      this.format = "yyyy-MM-dd";
      this.isYearEndFiscalYear = true;
    }

    else if (type === "Numeric") {
      this.scale = 0;
      this.precision = 18;
    }

    this.saqlExpression = saql_exp;

  }

  get object() {
    return Object.assign({}, this);
  }

}

module.exports = {
    Branch: Branch,
    Node: Node,
    Load: Load,
    Register: Register,
    Slice: Slice,
    Compute: Compute,
    ComputedField: ComputedField
}

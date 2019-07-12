import * as React from "react";
import { observer } from "mobx-react";
import { Field } from "../../model/field/Field";
// tslint:disable-next-line:no-duplicate-imports
import ReactSelect from "react-select";
import { translateFieldLabel, translateGenre } from "../../localization";

export interface IProps {
  field: Field;
}

/* This is for choices that have a distinct id vs. name, definitions, examples, etc.
  Maybe just genre & access.
  */
@observer
export default class GenreChooser extends React.Component<
  IProps & React.HTMLAttributes<HTMLDivElement>
> {
  public render() {
    const label = translateFieldLabel(this.props.field);
    const choices = this.props.field.definition.complexChoices
      ? this.props.field.definition.complexChoices
      : [];

    const options = choices.map(c => {
      let tip = c.definition;
      if (c.examples && c.examples.length > 0) {
        tip += "\nExamples: " + c.examples;
      }
      return new Object({
        value: c.id,
        label: translateGenre(c.label),
        title: tip
      });
    });

    let currentOption: object | null = null;
    if (this.props.field.text.trim().length > 0) {
      const matchingOption = options.find(
        (o: any) => o.value === this.props.field.text
      );
      currentOption = matchingOption
        ? matchingOption
        : {
            value: this.props.field.text,
            label: this.props.field.text + " <-- Not in List",
            title: "This value is not in the genre list."
          };
    }
    return (
      <div className={"field " + this.props.className}>
        <label>{label}</label>
        <ReactSelect
          value={currentOption}
          onChange={(s: any) => {
            this.props.field.text = (s && s.value ? s.value : "") as string;
          }}
          options={options}
        />
      </div>
    );
  }
}

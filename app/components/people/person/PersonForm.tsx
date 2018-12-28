import * as React from "react";
import { Person } from "../../../model/Project/Person/Person";
import { observer } from "mobx-react";
import TextFieldEdit from "../../TextFieldEdit";
import { FieldSet } from "../../../model/field/FieldSet";
import LanguageEdit from "./LanguageEdit";
import ClosedChoiceEdit from "../../ClosedChoiceEdit";
import MugShot from "./MugShot";
import "./PersonForm.scss";
import CustomFieldsTable from "../../CustomFieldsTable";
import { Trans } from "@lingui/react";

export interface IProps {
  person: Person;
  fields: FieldSet;
  validateFullName: (value: string) => boolean;
}

@observer
export default class PersonForm extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    const father = this.props.fields.getTextField("fathersLanguage");
    const mother = this.props.fields.getTextField("mothersLanguage");
    const oldName = this.props.fields.getTextField("name").text;
    return (
      <form className={"personForm"}>
        {/* <div className={"first-column"}> */}
        <TextFieldEdit
          validate={(value: string) => this.props.validateFullName(value)}
          field={this.props.fields.getTextField("name")}
          onBlur={() => {
            this.props.person.nameMightHaveChanged();
            // ID is s function of the name and the code
            this.props.person.IdMightHaveChanged();
          }}
          className="full-name left-side"
        />

        <TextFieldEdit
          className="nickname"
          field={this.props.fields.getTextField("nickname")}
        />
        <TextFieldEdit
          className="code"
          field={this.props.fields.getTextField("code")}
          onBlur={() => {
            // ID is s function of the name and the code
            this.props.person.IdMightHaveChanged();
          }}
        />

        <div className="primary-language">
          <label className="languageGroup">
            {this.props.fields.getTextField("primaryLanguage").englishLabel}
          </label>
          <LanguageEdit
            language={this.props.fields.getTextField("primaryLanguage")}
            fatherLanguage={this.props.fields.getTextField("fathersLanguage")}
            motherLanguage={this.props.fields.getTextField("mothersLanguage")}
          />
        </div>
        <TextFieldEdit
          className="primaryLanguageLearnedIn left-side"
          field={this.props.fields.getTextField("primaryLanguageLearnedIn")}
        />

        <div className="other-languages">
          <label className="languageGroup">
            <Trans>Other Languages</Trans>
          </label>
          <LanguageEdit
            language={this.props.fields.getTextField("otherLanguage0")}
            fatherLanguage={father}
            motherLanguage={mother}
          />
          <LanguageEdit
            language={this.props.fields.getTextField("otherLanguage1")}
            fatherLanguage={father}
            motherLanguage={mother}
          />
          <LanguageEdit
            language={this.props.fields.getTextField("otherLanguage2")}
            fatherLanguage={father}
            motherLanguage={mother}
          />
          <LanguageEdit
            language={this.props.fields.getTextField("otherLanguage3")}
            fatherLanguage={father}
            motherLanguage={mother}
          />
        </div>
        {/* uncomment for testing that the parent buttons are working
          <TextFieldEdit className={"language-name"} field={mother} />
          <TextFieldEdit className={"language-name"} field={father} /> */}
        <TextFieldEdit
          className="left-side"
          field={this.props.fields.getTextField("education")}
        />
        {/* </div> */}
        {/* <div className={"second-column"}> */}
        {/* <div className={"upper-right-cluster"}> */}
        <TextFieldEdit
          className={"birth"}
          field={this.props.fields.getTextField("birthYear")}
        />
        <ClosedChoiceEdit
          includeLabel={true}
          className={"gender"}
          field={this.props.fields.getTextField("gender")}
        />
        <MugShot
          person={this.props.person}
          unused={this.props.person.displayName}
        />
        {/* </div> */}
        <TextFieldEdit
          className="howToContact text-block full-right-side"
          field={this.props.fields.getTextField("howToContact")}
        />
        <TextFieldEdit
          field={this.props.fields.getTextField("ethnicGroup")}
          className="full-right-side"
        />
        <TextFieldEdit
          field={this.props.fields.getTextField("primaryOccupation")}
          className="full-right-side"
        />
        <CustomFieldsTable file={this.props.person.metadataFile!} />
      </form>
    );
  }
}

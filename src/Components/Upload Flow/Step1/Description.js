import React from "react";
import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const Description = ({ fetchedData, setFetchedData, setDescription }) => {
  const { t } = useTranslation();

  return (
    <Form.Group controlId='inputField' className='py-3'>
      <label style={{fontWeight:"500"}}>{t("uploadDocFlow.descriptionupload")}
      </label>
      <br />
      <Form.Control
        as='textarea'
        rows={5}
        placeholder={t("uploadDocFlow.descriptionPlaceholder")}
        value={fetchedData.description || ""}
        onChange={(e) => {
          setFetchedData({
            ...fetchedData,
            description: e.target.value,
          });
          setDescription(e.target.value);
        }}
      />
    </Form.Group>
  );
};

export default Description;

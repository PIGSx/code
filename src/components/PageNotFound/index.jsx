import React from "react";
import "./erro.scss";

const PageNotFound = () => {
  return (
    <>
      <div className="error-wrapper">
        <div className="error">
          <div className="wrap">
            <code>
              <span className="blue">&lt;!DOCTYPE</span>{" "}
              <span className="orange">html</span>
              <span className="blue">&gt;</span>
              <br />
              <span className="blue">&lt;html&gt;</span>
              <br />
              &nbsp; <span className="blue">&lt;style&gt;</span>
              <br />
              &nbsp;&nbsp;* <span className="blue">{`{`}</span>
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="green">everything</span>:
              <span className="blue">awesome</span>;
              <br />
              &nbsp;&nbsp;<span className="blue">{`}`}</span>
              <br />
              &nbsp; <span className="blue">&lt;/style&gt;</span>
              <br />
              &nbsp; <span className="blue">&lt;body&gt;</span>
              <br />
              &nbsp;&nbsp;&nbsp; <span className="comment">ERROR 404!</span>
              <br />
              &nbsp;&nbsp;&nbsp; <span className="comment">FILE NOT FOUND!</span>
              <br />
              &nbsp;&nbsp;&nbsp;{" "}
              <span className="comment">
                &lt;!-- The file you are looking for,
                <br />
                &nbsp;&nbsp;&nbsp; is not where you think it is. --&gt;
              </span>
              <br />
              &nbsp; <span className="blue">&lt;/body&gt;</span>
              <br />
              <span className="blue">&lt;/html&gt;</span>
            </code>
          </div>
        </div>

        <div className="info"></div>
      </div>
    </>
  );
};

export default PageNotFound;

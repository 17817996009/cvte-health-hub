const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// 查询疾病相关信息
async function queryDiseaseInfo(diseaseName) {
  const session = driver.session();
  
  try {
    const result = await session.run(
      `MATCH (d:Disease {name: $diseaseName})-[:has_symptom]->(s:Symptom)
       RETURN d.name AS disease, collect(s.name) AS symptoms`,
      { diseaseName }
    );
    
    if (result.records.length > 0) {
      return {
        disease: result.records[0].get('disease'),
        symptoms: result.records[0].get('symptoms')
      };
    }
    
    return null;
  } finally {
    await session.close();
  }
}

// 查询健康建议
async function queryHealthAdvice(condition) {
  const session = driver.session();
  
  try {
    const result = await session.run(
      `MATCH (c:Condition {name: $condition})-[:has_advice]->(a:Advice)
       RETURN a.content AS advice`,
      { condition }
    );
    
    return result.records.map(record => record.get('advice'));
  } finally {
    await session.close();
  }
}

module.exports = {
  queryDiseaseInfo,
  queryHealthAdvice
};
/**
 * A real OpenAlex response, recorded on 2026-10-05 from
 * GET https://api.openalex.org/works?search.title_abstract_keywords="peer feedback" academic writing
 * with filters 2018-2024, open access, type article, trimmed to the first five works and
 * to the fields ResearchKit reads (institutions and affiliations removed). Tests use it
 * so they never call OpenAlex.
 */
export const OPENALEX_PEER_FEEDBACK: unknown = {
  "meta": {
    "count": 234,
    "page": 1,
    "per_page": 6,
    "cost_usd": 0.001
  },
  "results": [
    {
      "id": "https://openalex.org/W2783481537",
      "doi": "https://doi.org/10.1080/02602938.2018.1424318",
      "title": "Peer feedback on academic writing: undergraduate students’ peer feedback role, peer feedback perceptions and essay performance",
      "display_name": "Peer feedback on academic writing: undergraduate students’ peer feedback role, peer feedback perceptions and essay performance",
      "publication_year": 2018,
      "publication_date": "2018-01-07",
      "type": "article",
      "language": "en",
      "biblio": {
        "volume": "43",
        "issue": "6",
        "first_page": "955",
        "last_page": "968"
      },
      "authorships": [
        {
          "author_position": "first",
          "author": {
            "id": "https://openalex.org/A5004912314",
            "display_name": "Bart Huisman"
          },
          "raw_author_name": "Bart Huisman"
        },
        {
          "author_position": "middle",
          "author": {
            "id": "https://openalex.org/A5073784731",
            "display_name": "Nadira Saab"
          },
          "raw_author_name": "Nadira Saab"
        },
        {
          "author_position": "middle",
          "author": {
            "id": "https://openalex.org/A5027061949",
            "display_name": "Jan H. VAN DRIEL"
          },
          "raw_author_name": "Jan van Driel"
        },
        {
          "author_position": "last",
          "author": {
            "id": "https://openalex.org/A5024015382",
            "display_name": "Paul van den Broek"
          },
          "raw_author_name": "Paul van den Broek"
        }
      ],
      "primary_location": {
        "id": "doi:10.1080/02602938.2018.1424318",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.1080/02602938.2018.1424318",
        "pdf_url": "https://www.tandfonline.com/doi/pdf/10.1080/02602938.2018.1424318?needAccess=true",
        "source": {
          "id": "https://openalex.org/S142259175",
          "display_name": "Assessment & Evaluation in Higher Education",
          "type": "journal",
          "host_organization_name": "Taylor & Francis"
        },
        "license": "cc-by-nc-nd",
        "version": "publishedVersion"
      },
      "best_oa_location": {
        "id": "doi:10.1080/02602938.2018.1424318",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.1080/02602938.2018.1424318",
        "pdf_url": "https://www.tandfonline.com/doi/pdf/10.1080/02602938.2018.1424318?needAccess=true",
        "source": {
          "id": "https://openalex.org/S142259175",
          "display_name": "Assessment & Evaluation in Higher Education",
          "type": "journal",
          "host_organization_name": "Taylor & Francis"
        },
        "license": "cc-by-nc-nd",
        "version": "publishedVersion"
      },
      "open_access": {
        "is_oa": true,
        "oa_status": "hybrid",
        "oa_url": "https://www.tandfonline.com/doi/pdf/10.1080/02602938.2018.1424318?needAccess=true",
        "any_repository_has_fulltext": true
      },
      "keywords": [
        {
          "id": "https://openalex.org/keywords/peer-feedback",
          "display_name": "peer feedback",
          "score": 1.0
        },
        {
          "id": "https://openalex.org/keywords/academic-writing",
          "display_name": "academic writing",
          "score": 0.9769999980926514
        },
        {
          "id": "https://openalex.org/keywords/writing-performance",
          "display_name": "writing performance",
          "score": 0.8090000152587891
        },
        {
          "id": "https://openalex.org/keywords/receiving-feedback",
          "display_name": "receiving feedback",
          "score": 0.9990000128746033
        },
        {
          "id": "https://openalex.org/keywords/undergraduate-students",
          "display_name": "undergraduate students",
          "score": 0.8199999928474426
        },
        {
          "id": "https://openalex.org/keywords/essay-writing",
          "display_name": "essay writing",
          "score": 0.45399999618530273
        }
      ],
      "topics": [
        {
          "id": "https://openalex.org/T10959",
          "display_name": "Student Assessment and Feedback",
          "score": 0.9997000098228455,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T11039",
          "display_name": "Evaluation of Teaching Practices",
          "score": 0.9945999979972839,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T12500",
          "display_name": "Reflective Practices in Education",
          "score": 0.9857000112533569,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        }
      ],
      "primary_topic": {
        "id": "https://openalex.org/T10959",
        "display_name": "Student Assessment and Feedback",
        "score": 0.9997000098228455,
        "subfield": {
          "display_name": "Education"
        },
        "field": {
          "display_name": "Social Sciences"
        }
      },
      "abstract_inverted_index": {
        "Within": [
          0
        ],
        "the": [
          1,
          16,
          21,
          39,
          59,
          78,
          98,
          101,
          138
        ],
        "higher": [
          2
        ],
        "education": [
          3
        ],
        "context,": [
          4
        ],
        "peer": [
          5,
          22,
          45,
          75,
          92,
          102,
          139,
          162
        ],
        "feedback": [
          6,
          23,
          46,
          76,
          93,
          103,
          117,
          140,
          163
        ],
        "is": [
          7,
          52
        ],
        "frequently": [
          8
        ],
        "applied": [
          9
        ],
        "as": [
          10,
          143,
          145
        ],
        "an": [
          11,
          81
        ],
        "instructional": [
          12
        ],
        "method.": [
          13
        ],
        "Research": [
          14
        ],
        "on": [
          15,
          48
        ],
        "learning": [
          17
        ],
        "mechanisms": [
          18
        ],
        "involved": [
          19
        ],
        "in": [
          20,
          77
        ],
        "process": [
          24
        ],
        "has": [
          25,
          47
        ],
        "covered": [
          26
        ],
        "aspects": [
          27
        ],
        "of": [
          28,
          38,
          62,
          80,
          100,
          122,
          127
        ],
        "both": [
          29,
          113,
          132
        ],
        "providing": [
          30,
          42,
          114
        ],
        "and": [
          31,
          43,
          106,
          115,
          165
        ],
        "receiving": [
          32,
          44,
          116
        ],
        "feedback.": [
          33
        ],
        "However,": [
          34,
          154
        ],
        "a": [
          35
        ],
        "direct": [
          36,
          156
        ],
        "comparison": [
          37
        ],
        "impact": [
          40
        ],
        "that": [
          41,
          112
        ],
        "students’": [
          49,
          91,
          147,
          166
        ],
        "writing": [
          50,
          60,
          84,
          108,
          123,
          167
        ],
        "performance": [
          51,
          61,
          168
        ],
        "still": [
          53
        ],
        "lacking.": [
          54
        ],
        "The": [
          55,
          125
        ],
        "current": [
          56
        ],
        "study": [
          57
        ],
        "compared": [
          58
        ],
        "undergraduate": [
          63
        ],
        "students": [
          64,
          136
        ],
        "(N": [
          65
        ],
        "=": [
          66
        ],
        "83)": [
          67
        ],
        "who": [
          68
        ],
        "either": [
          69
        ],
        "provided": [
          70
        ],
        "or": [
          71
        ],
        "received": [
          72,
          105
        ],
        "anonymous": [
          73
        ],
        "written": [
          74
        ],
        "context": [
          79
        ],
        "authentic": [
          82
        ],
        "academic": [
          83
        ],
        "task.": [
          85
        ],
        "In": [
          86
        ],
        "addition,": [
          87
        ],
        "we": [
          88
        ],
        "investigated": [
          89
        ],
        "whether": [
          90
        ],
        "perceptions": [
          94,
          164
        ],
        "were": [
          95
        ],
        "related": [
          96,
          131
        ],
        "to": [
          97,
          107,
          119,
          133,
          141,
          146,
          149
        ],
        "nature": [
          99
        ],
        "they": [
          104
        ],
        "performance.": [
          109,
          124
        ],
        "Results": [
          110
        ],
        "showed": [
          111
        ],
        "led": [
          118
        ],
        "similar": [
          120
        ],
        "improvements": [
          121
        ],
        "presence": [
          126
        ],
        "explanatory": [
          128
        ],
        "comments": [
          129
        ],
        "positively": [
          130
        ],
        "how": [
          134
        ],
        "adequate": [
          135
        ],
        "perceived": [
          137
        ],
        "be,": [
          142
        ],
        "well": [
          144
        ],
        "willingness": [
          148
        ],
        "improve": [
          150
        ],
        "based": [
          151
        ],
        "upon": [
          152
        ],
        "it.": [
          153
        ],
        "no": [
          155
        ],
        "relation": [
          157
        ],
        "was": [
          158
        ],
        "found": [
          159
        ],
        "between": [
          160
        ],
        "these": [
          161
        ],
        "increase.": [
          169
        ]
      },
      "is_retracted": false,
      "ids": {
        "openalex": "https://openalex.org/W2783481537",
        "doi": "https://doi.org/10.1080/02602938.2018.1424318",
        "mag": "2783481537"
      }
    },
    {
      "id": "https://openalex.org/W3012893227",
      "doi": "https://doi.org/10.1007/s11162-020-09591-y",
      "title": "Peer Feedback Improves Students’ Academic Self-Concept in Higher Education",
      "display_name": "Peer Feedback Improves Students’ Academic Self-Concept in Higher Education",
      "publication_year": 2020,
      "publication_date": "2020-03-23",
      "type": "article",
      "language": "en",
      "biblio": {
        "volume": "61",
        "issue": "6",
        "first_page": "706",
        "last_page": "724"
      },
      "authorships": [
        {
          "author_position": "first",
          "author": {
            "id": "https://openalex.org/A5033596672",
            "display_name": "Bianca A. Simonsmeier"
          },
          "raw_author_name": "Bianca A. Simonsmeier"
        },
        {
          "author_position": "middle",
          "author": {
            "id": "https://openalex.org/A5000806498",
            "display_name": "Henrike Peiffer"
          },
          "raw_author_name": "Henrike Peiffer"
        },
        {
          "author_position": "middle",
          "author": {
            "id": "https://openalex.org/A5005561036",
            "display_name": "Maja Flaig"
          },
          "raw_author_name": "Maja Flaig"
        },
        {
          "author_position": "last",
          "author": {
            "id": "https://openalex.org/A5110791922",
            "display_name": "Michael Schneider"
          },
          "raw_author_name": "Michael Schneider"
        }
      ],
      "primary_location": {
        "id": "doi:10.1007/s11162-020-09591-y",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.1007/s11162-020-09591-y",
        "pdf_url": "https://link.springer.com/content/pdf/10.1007/s11162-020-09591-y.pdf",
        "source": {
          "id": "https://openalex.org/S130619902",
          "display_name": "Research in Higher Education",
          "type": "journal",
          "host_organization_name": "Springer Science+Business Media"
        },
        "license": "cc-by",
        "version": "publishedVersion"
      },
      "best_oa_location": {
        "id": "doi:10.1007/s11162-020-09591-y",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.1007/s11162-020-09591-y",
        "pdf_url": "https://link.springer.com/content/pdf/10.1007/s11162-020-09591-y.pdf",
        "source": {
          "id": "https://openalex.org/S130619902",
          "display_name": "Research in Higher Education",
          "type": "journal",
          "host_organization_name": "Springer Science+Business Media"
        },
        "license": "cc-by",
        "version": "publishedVersion"
      },
      "open_access": {
        "is_oa": true,
        "oa_status": "hybrid",
        "oa_url": "https://link.springer.com/content/pdf/10.1007/s11162-020-09591-y.pdf",
        "any_repository_has_fulltext": false
      },
      "keywords": [
        {
          "id": "https://openalex.org/keywords/peer-feedback",
          "display_name": "peer feedback",
          "score": 1.0
        },
        {
          "id": "https://openalex.org/keywords/academic-self-concept",
          "display_name": "academic self-concept",
          "score": 1.0
        },
        {
          "id": "https://openalex.org/keywords/academic-writing",
          "display_name": "academic writing",
          "score": 0.9520000219345093
        },
        {
          "id": "https://openalex.org/keywords/undergraduate-psychology-students",
          "display_name": "undergraduate psychology students",
          "score": 0.6650000214576721
        },
        {
          "id": "https://openalex.org/keywords/self-efficacy",
          "display_name": "self-efficacy",
          "score": 0.5099999904632568
        },
        {
          "id": "https://openalex.org/keywords/academic-achievement",
          "display_name": "academic performance",
          "score": 0.5569999814033508
        },
        {
          "id": "https://openalex.org/keywords/domain-specificity",
          "display_name": "domain specificity",
          "score": 0.5220000147819519
        },
        {
          "id": "https://openalex.org/keywords/seminar-assignments",
          "display_name": "seminar assignments",
          "score": 0.34299999475479126
        }
      ],
      "topics": [
        {
          "id": "https://openalex.org/T10959",
          "display_name": "Student Assessment and Feedback",
          "score": 0.9983999729156494,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T11039",
          "display_name": "Evaluation of Teaching Practices",
          "score": 0.9940000176429749,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T10636",
          "display_name": "Innovative Teaching and Learning Methods",
          "score": 0.9886999726295471,
          "subfield": {
            "display_name": "Developmental and Educational Psychology"
          },
          "field": {
            "display_name": "Psychology"
          }
        }
      ],
      "primary_topic": {
        "id": "https://openalex.org/T10959",
        "display_name": "Student Assessment and Feedback",
        "score": 0.9983999729156494,
        "subfield": {
          "display_name": "Education"
        },
        "field": {
          "display_name": "Social Sciences"
        }
      },
      "abstract_inverted_index": {
        "Abstract": [
          0
        ],
        "Peer": [
          1
        ],
        "feedback": [
          2,
          25,
          63,
          138,
          142,
          182
        ],
        "has": [
          3
        ],
        "been": [
          4
        ],
        "shown": [
          5
        ],
        "to": [
          6,
          11,
          128,
          140,
          188
        ],
        "be": [
          7
        ],
        "an": [
          8,
          107,
          185
        ],
        "effective": [
          9,
          186
        ],
        "strategy": [
          10
        ],
        "improve": [
          12
        ],
        "academic": [
          13,
          27,
          34,
          71,
          122,
          146
        ],
        "achievement.": [
          14
        ],
        "However,": [
          15
        ],
        "little": [
          16
        ],
        "evidence": [
          17
        ],
        "is": [
          18,
          184
        ],
        "available": [
          19
        ],
        "about": [
          20
        ],
        "the": [
          21,
          53,
          68,
          90,
          119,
          133,
          160,
          163,
          171,
          174,
          192
        ],
        "effects": [
          22
        ],
        "of": [
          23,
          55,
          70,
          76,
          83,
          121,
          136,
          194
        ],
        "peer": [
          24,
          62,
          137,
          181
        ],
        "on": [
          26,
          52,
          65,
          143
        ],
        "outcomes": [
          28
        ],
        "other": [
          29
        ],
        "than": [
          30
        ],
        "achievement,": [
          31
        ],
        "such": [
          32
        ],
        "as": [
          33,
          73,
          106,
          126,
          159
        ],
        "self-concept": [
          35
        ],
        "(ASC).": [
          36
        ],
        "ASC": [
          37,
          66,
          117,
          144,
          190
        ],
        "and": [
          38,
          43,
          109,
          166
        ],
        "achievement": [
          39
        ],
        "are": [
          40
        ],
        "reciprocally": [
          41
        ],
        "related": [
          42
        ],
        "thus": [
          44
        ],
        "mutual": [
          45
        ],
        "reinforce": [
          46
        ],
        "themselves.": [
          47
        ],
        "The": [
          48,
          87,
          154
        ],
        "present": [
          49
        ],
        "study": [
          50,
          88
        ],
        "focuses": [
          51
        ],
        "effect": [
          54,
          135,
          155
        ],
        "a": [
          56,
          74,
          77,
          81,
          96,
          100,
          110,
          129,
          180
        ],
        "four": [
          57
        ],
        "week": [
          58
        ],
        "long": [
          59
        ],
        "structured": [
          60
        ],
        "web-based": [
          61
        ],
        "intervention": [
          64
        ],
        "in": [
          67,
          80,
          95,
          116,
          179,
          191
        ],
        "domain": [
          69,
          120,
          157
        ],
        "writing": [
          72,
          123,
          147
        ],
        "part": [
          75
        ],
        "seminar": [
          78
        ],
        "assignment": [
          79
        ],
        "sample": [
          82
        ],
        "undergraduate": [
          84
        ],
        "psychology": [
          85
        ],
        "students.": [
          86
        ],
        "investigated": [
          89
        ],
        "effectiveness": [
          91
        ],
        "with": [
          92,
          99,
          150
        ],
        "49": [
          93
        ],
        "students": [
          94
        ],
        "randomized-controlled": [
          97
        ],
        "trial": [
          98
        ],
        "pre-and": [
          101
        ],
        "post-test.": [
          102
        ],
        "Each": [
          103
        ],
        "student": [
          104
        ],
        "acted": [
          105
        ],
        "author": [
          108
        ],
        "reviewer.": [
          111
        ],
        "Results": [
          112
        ],
        "indicated": [
          113
        ],
        "significant": [
          114
        ],
        "improvements": [
          115
        ],
        "for": [
          118,
          145,
          162
        ],
        "over": [
          124
        ],
        "time": [
          125
        ],
        "compared": [
          127,
          139
        ],
        "control": [
          130
        ],
        "group.": [
          131
        ],
        "Furthermore,": [
          132
        ],
        "causal": [
          134
        ],
        "no": [
          141
        ],
        "was": [
          148,
          156
        ],
        "strong": [
          149
        ],
        "d": [
          151
        ],
        "=": [
          152
        ],
        "0.72.": [
          153
        ],
        "specific,": [
          158
        ],
        "ASCs": [
          161
        ],
        "sub-domains": [
          164
        ],
        "statistics": [
          165
        ],
        "language": [
          167
        ],
        "remained": [
          168
        ],
        "unchanged": [
          169
        ],
        "by": [
          170
        ],
        "intervention.": [
          172
        ],
        "Overall,": [
          173
        ],
        "results": [
          175
        ],
        "revealed": [
          176
        ],
        "that": [
          177
        ],
        "participation": [
          178
        ],
        "system": [
          183
        ],
        "method": [
          187
        ],
        "enhance": [
          189
        ],
        "context": [
          193
        ],
        "higher": [
          195
        ],
        "education.": [
          196
        ]
      },
      "is_retracted": false,
      "ids": {
        "openalex": "https://openalex.org/W3012893227",
        "doi": "https://doi.org/10.1007/s11162-020-09591-y",
        "mag": "3012893227"
      }
    },
    {
      "id": "https://openalex.org/W2954180180",
      "doi": "https://doi.org/10.29140/jaltcall.v15n1.158",
      "title": "Enhancing peer feedback practices through screencasts in blended academic writing courses",
      "display_name": "Enhancing peer feedback practices through screencasts in blended academic writing courses",
      "publication_year": 2019,
      "publication_date": "2019-04-30",
      "type": "article",
      "language": "en",
      "biblio": {
        "volume": "15",
        "issue": "1",
        "first_page": "43",
        "last_page": "59"
      },
      "authorships": [
        {
          "author_position": "first",
          "author": {
            "id": "https://openalex.org/A5044292599",
            "display_name": "Bradley Irwin"
          },
          "raw_author_name": "Bradley Irwin"
        }
      ],
      "primary_location": {
        "id": "doi:10.29140/jaltcall.v15n1.158",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.29140/jaltcall.v15n1.158",
        "pdf_url": null,
        "source": {
          "id": "https://openalex.org/S4210185419",
          "display_name": "The JALT CALL Journal",
          "type": "journal",
          "host_organization_name": null
        },
        "license": "cc-by-nc",
        "version": "publishedVersion"
      },
      "best_oa_location": {
        "id": "doi:10.29140/jaltcall.v15n1.158",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.29140/jaltcall.v15n1.158",
        "pdf_url": null,
        "source": {
          "id": "https://openalex.org/S4210185419",
          "display_name": "The JALT CALL Journal",
          "type": "journal",
          "host_organization_name": null
        },
        "license": "cc-by-nc",
        "version": "publishedVersion"
      },
      "open_access": {
        "is_oa": true,
        "oa_status": "diamond",
        "oa_url": "https://doi.org/10.29140/jaltcall.v15n1.158",
        "any_repository_has_fulltext": false
      },
      "keywords": [
        {
          "id": "https://openalex.org/keywords/peer-feedback",
          "display_name": "peer feedback",
          "score": 0.9980000257492065
        },
        {
          "id": "https://openalex.org/keywords/blended-learning",
          "display_name": "blended learning",
          "score": 0.902999997138977
        },
        {
          "id": "https://openalex.org/keywords/academic-writing-instruction",
          "display_name": "academic writing instruction",
          "score": 0.7950000166893005
        },
        {
          "id": "https://openalex.org/keywords/formative-feedback",
          "display_name": "formative feedback",
          "score": 0.6650000214576721
        },
        {
          "id": "https://openalex.org/keywords/english-as-a-second-language",
          "display_name": "English as a second language",
          "score": 0.7239999771118164
        },
        {
          "id": "https://openalex.org/keywords/first-year-students",
          "display_name": "first-year students",
          "score": 0.6019999980926514
        },
        {
          "id": "https://openalex.org/keywords/essay-revision",
          "display_name": "essay revision",
          "score": 0.7699999809265137
        },
        {
          "id": "https://openalex.org/keywords/target-language-use",
          "display_name": "target language use",
          "score": 0.7020000219345093
        },
        {
          "id": "https://openalex.org/keywords/student-perceptions",
          "display_name": "student perceptions",
          "score": 0.5490000247955322
        },
        {
          "id": "https://openalex.org/keywords/japanese-learners-of-english",
          "display_name": "Japanese learners of English",
          "score": 0.7440000176429749
        }
      ],
      "topics": [
        {
          "id": "https://openalex.org/T12500",
          "display_name": "Reflective Practices in Education",
          "score": 0.9929999709129333,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T12354",
          "display_name": "Innovations in Educational Methods",
          "score": 0.9625999927520752,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T10636",
          "display_name": "Innovative Teaching and Learning Methods",
          "score": 0.9513999819755554,
          "subfield": {
            "display_name": "Developmental and Educational Psychology"
          },
          "field": {
            "display_name": "Psychology"
          }
        }
      ],
      "primary_topic": {
        "id": "https://openalex.org/T12500",
        "display_name": "Reflective Practices in Education",
        "score": 0.9929999709129333,
        "subfield": {
          "display_name": "Education"
        },
        "field": {
          "display_name": "Social Sciences"
        }
      },
      "abstract_inverted_index": {
        "The": [
          0,
          37,
          54
        ],
        "case": [
          1
        ],
        "study": [
          2
        ],
        "presented": [
          3
        ],
        "in": [
          4,
          30,
          110,
          141,
          167
        ],
        "this": [
          5
        ],
        "paper": [
          6
        ],
        "investigates": [
          7
        ],
        "the": [
          8,
          11,
          23,
          68,
          72,
          83,
          115,
          149,
          152
        ],
        "roles": [
          9
        ],
        "that": [
          10,
          57,
          91,
          100,
          148
        ],
        "Moodle": [
          12,
          73,
          153
        ],
        "workshop": [
          13,
          74,
          154
        ],
        "activity": [
          14,
          155
        ],
        "module": [
          15,
          75,
          156
        ],
        "and": [
          16,
          63,
          76,
          139,
          157
        ],
        "peer": [
          17,
          27,
          44,
          65,
          142,
          163
        ],
        "feedback": [
          18,
          28,
          45,
          52,
          78,
          90,
          108,
          137,
          143,
          158,
          164
        ],
        "screencast": [
          19,
          77,
          136
        ],
        "training": [
          20,
          79,
          138,
          159
        ],
        "have": [
          21
        ],
        "on": [
          22
        ],
        "development": [
          24,
          38
        ],
        "of": [
          25,
          39,
          71,
          114,
          125,
          151
        ],
        "formative": [
          26
        ],
        "practices": [
          29,
          46,
          165
        ],
        "low": [
          31,
          168
        ],
        "level": [
          32,
          169
        ],
        "English": [
          33
        ],
        "academic": [
          34,
          171
        ],
        "writing": [
          35,
          172
        ],
        "classes.": [
          36
        ],
        "26": [
          40
        ],
        "first-year": [
          41
        ],
        "Japanese": [
          42
        ],
        "students’": [
          43
        ],
        "were": [
          47,
          103
        ],
        "tracked": [
          48
        ],
        "over": [
          49
        ],
        "6": [
          50
        ],
        "separate": [
          51
        ],
        "sessions.": [
          53
        ],
        "findings": [
          55,
          98
        ],
        "indicate": [
          56
        ],
        "without": [
          58
        ],
        "training,": [
          59
        ],
        "students": [
          60,
          102
        ],
        "produced": [
          61
        ],
        "vague": [
          62
        ],
        "unhelpful": [
          64
        ],
        "feedback.": [
          66
        ],
        "However,": [
          67
        ],
        "intuitive": [
          69
        ],
        "structure": [
          70
        ],
        "sessions": [
          80
        ],
        "helped": [
          81
        ],
        "develop": [
          82
        ],
        "skills": [
          84
        ],
        "necessary": [
          85
        ],
        "to": [
          86,
          106,
          130
        ],
        "offer": [
          87,
          107
        ],
        "critically": [
          88
        ],
        "evaluative": [
          89
        ],
        "proved": [
          92
        ],
        "useful": [
          93
        ],
        "for": [
          94
        ],
        "essay": [
          95
        ],
        "revision.": [
          96
        ],
        "Further": [
          97
        ],
        "show": [
          99
        ],
        "although": [
          101
        ],
        "initially": [
          104
        ],
        "reluctant": [
          105
        ],
        "written": [
          109
        ],
        "English,": [
          111
        ],
        "their": [
          112,
          126
        ],
        "use": [
          113
        ],
        "target": [
          116
        ],
        "language": [
          117
        ],
        "increased": [
          118
        ],
        "with": [
          119
        ],
        "adequate": [
          120
        ],
        "practice.": [
          121
        ],
        "Finally,": [
          122
        ],
        "student": [
          123
        ],
        "perceptions": [
          124
        ],
        "own": [
          127
        ],
        "abilities": [
          128
        ],
        "point": [
          129
        ],
        "a": [
          131
        ],
        "highly": [
          132
        ],
        "significant": [
          133
        ],
        "relationship": [
          134
        ],
        "between": [
          135
        ],
        "improvement": [
          140
        ],
        "practices.": [
          144
        ],
        "These": [
          145
        ],
        "results": [
          146
        ],
        "suggest": [
          147
        ],
        "combination": [
          150
        ],
        "screencasts": [
          160
        ],
        "facilitate": [
          161
        ],
        "effective": [
          162
        ],
        "even": [
          166
        ],
        "l2": [
          170
        ],
        "courses.": [
          173
        ]
      },
      "is_retracted": false,
      "ids": {
        "openalex": "https://openalex.org/W2954180180",
        "doi": "https://doi.org/10.29140/jaltcall.v15n1.158",
        "mag": "2954180180"
      }
    },
    {
      "id": "https://openalex.org/W4405716224",
      "doi": "https://doi.org/10.33394/jo-elt.v11i2.13330",
      "title": "Peer Feedback in Academic Writing: Students' Perspectives on Learning and Improvement",
      "display_name": "Peer Feedback in Academic Writing: Students' Perspectives on Learning and Improvement",
      "publication_year": 2024,
      "publication_date": "2024-12-24",
      "type": "article",
      "language": "en",
      "biblio": {
        "volume": "11",
        "issue": "2",
        "first_page": "233",
        "last_page": "233"
      },
      "authorships": [
        {
          "author_position": "first",
          "author": {
            "id": "https://openalex.org/A5012469253",
            "display_name": "Neni Nurkhamidah"
          },
          "raw_author_name": "Neni Nurkhamidah"
        },
        {
          "author_position": "middle",
          "author": {
            "id": "https://openalex.org/A5102738101",
            "display_name": "Ninuk Lustyantie"
          },
          "raw_author_name": "Ninuk Lustyantie"
        },
        {
          "author_position": "last",
          "author": {
            "id": "https://openalex.org/A5006105438",
            "display_name": "Uwes Anis Chaeruman"
          },
          "raw_author_name": "Uwes Anis Chaeruman"
        }
      ],
      "primary_location": {
        "id": "doi:10.33394/jo-elt.v11i2.13330",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.33394/jo-elt.v11i2.13330",
        "pdf_url": "https://e-journal.undikma.ac.id/index.php/joelt/article/download/13330/6507",
        "source": {
          "id": "https://openalex.org/S4210198889",
          "display_name": "Jo-ELT (Journal of English Language Teaching) Fakultas Pendidikan Bahasa & Seni Prodi Pendidikan Bahasa Inggris IKIP",
          "type": "journal",
          "host_organization_name": null
        },
        "license": "cc-by-sa",
        "version": "publishedVersion"
      },
      "best_oa_location": {
        "id": "doi:10.33394/jo-elt.v11i2.13330",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.33394/jo-elt.v11i2.13330",
        "pdf_url": "https://e-journal.undikma.ac.id/index.php/joelt/article/download/13330/6507",
        "source": {
          "id": "https://openalex.org/S4210198889",
          "display_name": "Jo-ELT (Journal of English Language Teaching) Fakultas Pendidikan Bahasa & Seni Prodi Pendidikan Bahasa Inggris IKIP",
          "type": "journal",
          "host_organization_name": null
        },
        "license": "cc-by-sa",
        "version": "publishedVersion"
      },
      "open_access": {
        "is_oa": true,
        "oa_status": "gold",
        "oa_url": "https://e-journal.undikma.ac.id/index.php/joelt/article/download/13330/6507",
        "any_repository_has_fulltext": true
      },
      "keywords": [
        {
          "id": "https://openalex.org/keywords/peer-feedback",
          "display_name": "peer feedback",
          "score": 1.0
        },
        {
          "id": "https://openalex.org/keywords/academic-writing",
          "display_name": "academic writing",
          "score": 0.9900000095367432
        },
        {
          "id": "https://openalex.org/keywords/student-perceptions",
          "display_name": "student perceptions",
          "score": 0.925000011920929
        },
        {
          "id": "https://openalex.org/keywords/writing-skills",
          "display_name": "writing skills",
          "score": 0.5649999976158142
        },
        {
          "id": "https://openalex.org/keywords/feedback-quality",
          "display_name": "feedback quality",
          "score": 0.6420000195503235
        },
        {
          "id": "https://openalex.org/keywords/self-assessment",
          "display_name": "self-assessment",
          "score": 0.6800000071525574
        },
        {
          "id": "https://openalex.org/keywords/student-self-confidence",
          "display_name": "student self-confidence",
          "score": 0.5960000157356262
        },
        {
          "id": "https://openalex.org/keywords/collaboration",
          "display_name": "collaboration",
          "score": 0.42399999499320984
        },
        {
          "id": "https://openalex.org/keywords/critical-reflection",
          "display_name": "critical reflection",
          "score": 0.8410000205039978
        },
        {
          "id": "https://openalex.org/keywords/writing-process",
          "display_name": "writing process",
          "score": 0.5180000066757202
        }
      ],
      "topics": [
        {
          "id": "https://openalex.org/T10959",
          "display_name": "Student Assessment and Feedback",
          "score": 0.9713000059127808,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T12500",
          "display_name": "Reflective Practices in Education",
          "score": 0.9677000045776367,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T11715",
          "display_name": "Education and Critical Thinking Development",
          "score": 0.9574999809265137,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        }
      ],
      "primary_topic": {
        "id": "https://openalex.org/T10959",
        "display_name": "Student Assessment and Feedback",
        "score": 0.9713000059127808,
        "subfield": {
          "display_name": "Education"
        },
        "field": {
          "display_name": "Social Sciences"
        }
      },
      "abstract_inverted_index": {
        "Peer": [
          0
        ],
        "feedback": [
          1,
          31,
          70,
          91,
          118
        ],
        "in": [
          2,
          22,
          32,
          116,
          150
        ],
        "academic": [
          3
        ],
        "writing": [
          4,
          16,
          77,
          152,
          173
        ],
        "classes": [
          5
        ],
        "has": [
          6
        ],
        "gained": [
          7
        ],
        "considerable": [
          8
        ],
        "attention": [
          9
        ],
        "for": [
          10,
          75
        ],
        "its": [
          11
        ],
        "potential": [
          12
        ],
        "to": [
          13,
          54,
          105,
          171
        ],
        "enhance": [
          14,
          144
        ],
        "students'": [
          15,
          27
        ],
        "abilities,": [
          17
        ],
        "critical": [
          18,
          83
        ],
        "thinking,": [
          19
        ],
        "and": [
          20,
          81,
          90,
          109,
          132,
          147,
          165,
          175
        ],
        "engagement": [
          21,
          149
        ],
        "learning.": [
          23
        ],
        "This": [
          24
        ],
        "study": [
          25,
          44
        ],
        "investigates": [
          26
        ],
        "perceptions": [
          28
        ],
        "of": [
          29,
          96,
          114,
          126
        ],
        "peer": [
          30,
          69,
          155
        ],
        "an": [
          33
        ],
        "Academic": [
          34
        ],
        "Writing": [
          35
        ],
        "course": [
          36
        ],
        "at": [
          37
        ],
        "MNC": [
          38
        ],
        "University.": [
          39
        ],
        "Using": [
          40
        ],
        "a": [
          41,
          72,
          162
        ],
        "qualitative": [
          42
        ],
        "case": [
          43
        ],
        "approach,": [
          45
        ],
        "data": [
          46
        ],
        "were": [
          47
        ],
        "collected": [
          48
        ],
        "through": [
          49
        ],
        "interviews": [
          50
        ],
        "with": [
          51
        ],
        "seven": [
          52
        ],
        "students": [
          53,
          67
        ],
        "gain": [
          55
        ],
        "in-depth": [
          56
        ],
        "insights": [
          57
        ],
        "into": [
          58
        ],
        "their": [
          59,
          103
        ],
        "experiences.": [
          60
        ],
        "The": [
          61
        ],
        "findings": [
          62,
          122
        ],
        "reveal": [
          63
        ],
        "that": [
          64
        ],
        "while": [
          65
        ],
        "most": [
          66
        ],
        "view": [
          68
        ],
        "as": [
          71
        ],
        "valuable": [
          73
        ],
        "tool": [
          74
        ],
        "improving": [
          76
        ],
        "skills,": [
          78,
          146
        ],
        "fostering": [
          79
        ],
        "collaboration,": [
          80,
          143
        ],
        "encouraging": [
          82
        ],
        "reflection,": [
          84
        ],
        "others": [
          85
        ],
        "express": [
          86
        ],
        "concerns": [
          87
        ],
        "about": [
          88,
          102
        ],
        "confidence": [
          89
        ],
        "quality.": [
          92
        ],
        "Specifically,": [
          93
        ],
        "nearly": [
          94
        ],
        "half": [
          95
        ],
        "the": [
          97,
          112,
          117,
          124,
          151
        ],
        "participants": [
          98
        ],
        "reported": [
          99
        ],
        "feeling": [
          100
        ],
        "unsure": [
          101
        ],
        "ability": [
          104
        ],
        "provide": [
          106
        ],
        "effective": [
          107
        ],
        "feedback,": [
          108,
          156
        ],
        "several": [
          110
        ],
        "noted": [
          111
        ],
        "lack": [
          113
        ],
        "clarity": [
          115
        ],
        "they": [
          119
        ],
        "received.": [
          120
        ],
        "These": [
          121
        ],
        "underscore": [
          123
        ],
        "importance": [
          125
        ],
        "providing": [
          127
        ],
        "clearer": [
          128
        ],
        "guidelines": [
          129
        ],
        "on": [
          130
        ],
        "giving": [
          131
        ],
        "implementing": [
          133
        ],
        "feedback.": [
          134
        ],
        "By": [
          135
        ],
        "addressing": [
          136
        ],
        "these": [
          137
        ],
        "challenges,": [
          138
        ],
        "instructors": [
          139
        ],
        "can": [
          140,
          160
        ],
        "foster": [
          141
        ],
        "stronger": [
          142
        ],
        "self-assessment": [
          145
        ],
        "boost": [
          148
        ],
        "process.": [
          153
        ],
        "Structured": [
          154
        ],
        "when": [
          157
        ],
        "integrated": [
          158
        ],
        "effectively,": [
          159
        ],
        "create": [
          161
        ],
        "more": [
          163
        ],
        "interactive": [
          164
        ],
        "reflective": [
          166
        ],
        "learning": [
          167
        ],
        "environment,": [
          168
        ],
        "ultimately": [
          169
        ],
        "contributing": [
          170
        ],
        "improved": [
          172
        ],
        "performance": [
          174
        ],
        "broader": [
          176
        ],
        "educational": [
          177
        ],
        "goals.": [
          178
        ]
      },
      "is_retracted": false,
      "ids": {
        "openalex": "https://openalex.org/W4405716224",
        "doi": "https://doi.org/10.33394/jo-elt.v11i2.13330"
      }
    },
    {
      "id": "https://openalex.org/W4212973630",
      "doi": "https://doi.org/10.18196/ftl.v7i1.12751",
      "title": "English Education Master Students' Perceptions on Peer Feedback in Academic Writing",
      "display_name": "English Education Master Students' Perceptions on Peer Feedback in Academic Writing",
      "publication_year": 2022,
      "publication_date": "2022-02-18",
      "type": "article",
      "language": "en",
      "biblio": {
        "volume": "7",
        "issue": "1",
        "first_page": "117",
        "last_page": "137"
      },
      "authorships": [
        {
          "author_position": "first",
          "author": {
            "id": "https://openalex.org/A5043312937",
            "display_name": "Kristian Florensio Wijaya"
          },
          "raw_author_name": "Kristian Florensio Wijaya"
        }
      ],
      "primary_location": {
        "id": "doi:10.18196/ftl.v7i1.12751",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.18196/ftl.v7i1.12751",
        "pdf_url": "https://journal.umy.ac.id/index.php/FTL/article/download/12751/pdf",
        "source": {
          "id": "https://openalex.org/S4210181208",
          "display_name": "Journal of Foreign Languange Teaching and Learning",
          "type": "journal",
          "host_organization_name": "Muhammadiyah University of Yogyakarta"
        },
        "license": "cc-by-sa",
        "version": "publishedVersion"
      },
      "best_oa_location": {
        "id": "doi:10.18196/ftl.v7i1.12751",
        "is_oa": true,
        "landing_page_url": "https://doi.org/10.18196/ftl.v7i1.12751",
        "pdf_url": "https://journal.umy.ac.id/index.php/FTL/article/download/12751/pdf",
        "source": {
          "id": "https://openalex.org/S4210181208",
          "display_name": "Journal of Foreign Languange Teaching and Learning",
          "type": "journal",
          "host_organization_name": "Muhammadiyah University of Yogyakarta"
        },
        "license": "cc-by-sa",
        "version": "publishedVersion"
      },
      "open_access": {
        "is_oa": true,
        "oa_status": "diamond",
        "oa_url": "https://journal.umy.ac.id/index.php/FTL/article/download/12751/pdf",
        "any_repository_has_fulltext": true
      },
      "keywords": [
        {
          "id": "https://openalex.org/keywords/peer-feedback",
          "display_name": "peer feedback",
          "score": 1.0
        },
        {
          "id": "https://openalex.org/keywords/academic-writing",
          "display_name": "academic writing",
          "score": 0.9990000128746033
        },
        {
          "id": "https://openalex.org/keywords/student-perceptions",
          "display_name": "student perceptions",
          "score": 0.7009999752044678
        },
        {
          "id": "https://openalex.org/keywords/efl-learners",
          "display_name": "EFL learners",
          "score": 0.7979999780654907
        },
        {
          "id": "https://openalex.org/keywords/english-as-a-foreign-language",
          "display_name": "English as a foreign language",
          "score": 0.6420000195503235
        }
      ],
      "topics": [
        {
          "id": "https://openalex.org/T11715",
          "display_name": "Education and Critical Thinking Development",
          "score": 0.9835000038146973,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T12500",
          "display_name": "Reflective Practices in Education",
          "score": 0.9531000256538391,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        },
        {
          "id": "https://openalex.org/T10959",
          "display_name": "Student Assessment and Feedback",
          "score": 0.9401999711990356,
          "subfield": {
            "display_name": "Education"
          },
          "field": {
            "display_name": "Social Sciences"
          }
        }
      ],
      "primary_topic": {
        "id": "https://openalex.org/T11715",
        "display_name": "Education and Critical Thinking Development",
        "score": 0.9835000038146973,
        "subfield": {
          "display_name": "Education"
        },
        "field": {
          "display_name": "Social Sciences"
        }
      },
      "abstract_inverted_index": {
        "AbstractThis": [
          0
        ],
        "present": [
          1
        ],
        "qualitative": [
          2,
          173
        ],
        "study": [
          3,
          24
        ],
        "aimed": [
          4
        ],
        "to": [
          5,
          26,
          47,
          76,
          105,
          147
        ],
        "explore": [
          6
        ],
        "English": [
          7,
          78,
          169
        ],
        "Education": [
          8,
          79,
          170
        ],
        "Master": [
          9,
          80,
          171
        ],
        "Students’": [
          10
        ],
        "perceptions": [
          11
        ],
        "on": [
          12
        ],
        "peer": [
          13,
          35,
          96,
          154
        ],
        "feedback": [
          14,
          36,
          97,
          155
        ],
        "in": [
          15,
          33,
          38,
          99,
          103,
          115,
          157
        ],
        "academic": [
          16,
          39,
          100,
          152,
          167
        ],
        "writing.": [
          17
        ],
        "One": [
          18
        ],
        "major": [
          19
        ],
        "reason": [
          20
        ],
        "for": [
          21,
          30,
          141
        ],
        "conducting": [
          22
        ],
        "this": [
          23,
          58
        ],
        "was": [
          25,
          45
        ],
        "shed": [
          27
        ],
        "more": [
          28,
          108,
          126,
          139
        ],
        "enlightenment": [
          29,
          140
        ],
        "ELT": [
          31,
          143
        ],
        "parties": [
          32,
          144
        ],
        "maximizing": [
          34
        ],
        "activities": [
          37,
          102,
          156
        ],
        "writing": [
          40,
          101,
          153
        ],
        "classes.": [
          41
        ],
        "Qualitative": [
          42
        ],
        "content": [
          43,
          174
        ],
        "analysis": [
          44,
          175
        ],
        "utilized": [
          46
        ],
        "attain": [
          48
        ],
        "clearer": [
          49
        ],
        "portrayals": [
          50
        ],
        "out": [
          51
        ],
        "of": [
          52,
          151
        ],
        "the": [
          53,
          148
        ],
        "specific": [
          54,
          133
        ],
        "phenomenon.": [
          55
        ],
        "To": [
          56,
          128
        ],
        "fulfill": [
          57
        ],
        "research": [
          59,
          88,
          134
        ],
        "aim,": [
          60
        ],
        "10": [
          61
        ],
        "online": [
          62
        ],
        "Likert-scale": [
          63
        ],
        "questionnaire": [
          64
        ],
        "items": [
          65
        ],
        "along": [
          66
        ],
        "with": [
          67,
          145,
          159
        ],
        "5": [
          68
        ],
        "open-ended": [
          69
        ],
        "written": [
          70
        ],
        "narrative": [
          71
        ],
        "inquiry": [
          72
        ],
        "questions": [
          73
        ],
        "were": [
          74
        ],
        "administered": [
          75
        ],
        "15": [
          77
        ],
        "Students,": [
          81
        ],
        "Sanata": [
          82
        ],
        "Dharma": [
          83
        ],
        "University,": [
          84
        ],
        "batch": [
          85
        ],
        "2019.": [
          86
        ],
        "The": [
          87
        ],
        "results": [
          89,
          135
        ],
        "strongly": [
          90
        ],
        "suggested": [
          91
        ],
        "EFL": [
          92,
          162
        ],
        "educators": [
          93
        ],
        "continually": [
          94
        ],
        "cultivating": [
          95
        ],
        "practices": [
          98
        ],
        "order": [
          104
        ],
        "better": [
          106
        ],
        "promote": [
          107
        ],
        "enjoyable,": [
          109
        ],
        "meaningful,": [
          110
        ],
        "and": [
          111,
          120
        ],
        "holistic": [
          112
        ],
        "learning": [
          113
        ],
        "environments": [
          114
        ],
        "which": [
          116
        ],
        "learners’": [
          117,
          163
        ],
        "target": [
          118
        ],
        "language": [
          119
        ],
        "future": [
          121
        ],
        "life": [
          122
        ],
        "competencies": [
          123
        ],
        "are": [
          124
        ],
        "thriving": [
          125
        ],
        "fruitfully.": [
          127
        ],
        "a": [
          129
        ],
        "lesser": [
          130
        ],
        "extent,": [
          131
        ],
        "these": [
          132
        ],
        "can": [
          136
        ],
        "potentially": [
          137
        ],
        "give": [
          138
        ],
        "globalized": [
          142
        ],
        "regard": [
          146
        ],
        "appropriate": [
          149
        ],
        "utilization": [
          150
        ],
        "accord": [
          158
        ],
        "graduate": [
          160
        ],
        "university": [
          161
        ],
        "perspectives.Keywords:": [
          164
        ],
        "Peer": [
          165
        ],
        "feedback;": [
          166
        ],
        "writing,": [
          168
        ],
        "students;": [
          172
        ]
      },
      "is_retracted": false,
      "ids": {
        "openalex": "https://openalex.org/W4212973630",
        "doi": "https://doi.org/10.18196/ftl.v7i1.12751"
      }
    }
  ]
};
